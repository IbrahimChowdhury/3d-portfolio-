import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import {
  auth,
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase/config';
import {
  clampString,
  DEFAULT_CERTIFICATES,
  DEFAULT_EDUCATION,
  DEFAULT_PROFILE,
  DEFAULT_PROJECTS,
  DEFAULT_SKILLS,
  slugifyId,
  type CertificateItem,
  type ContactMessage,
  type EducationItem,
  type MessageStatus,
  type PortfolioProfile,
  type ProjectItem,
  type SkillCategory,
} from '../data/portfolioData';

interface PortfolioContextValue {
  // Auth state
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;

  // Live portfolio data (all items when admin, published items for public)
  profile: PortfolioProfile;
  skills: SkillCategory[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  education: EducationItem[];
  messages: ContactMessage[];
  hasCloudProfile: boolean;
  isLoadingData: boolean;
  isSyncing: boolean;
  lastSavedMessage: string | null;

  // Admin & Visitor mutations
  saveProfile: (next: PortfolioProfile) => Promise<void>;
  saveSkill: (skill: SkillCategory, isNew?: boolean) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  saveProject: (project: ProjectItem, isNew?: boolean) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveCertificate: (cert: CertificateItem, isNew?: boolean) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
  saveEducation: (edu: EducationItem, isNew?: boolean) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  submitContactMessage: (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => Promise<void>;
  updateMessageStatus: (id: string, status: MessageStatus) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  seedFromCV: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

function tsToMillis(val: unknown): number {
  if (val && typeof val === 'object' && 'toMillis' in val) {
    return (val as Timestamp).toMillis();
  }
  return Date.now();
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [profile, setProfile] = useState<PortfolioProfile>(DEFAULT_PROFILE);
  const [hasCloudProfile, setHasCloudProfile] = useState(false);
  const [skills, setSkills] = useState<SkillCategory[]>(DEFAULT_SKILLS);
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [certificates, setCertificates] = useState<CertificateItem[]>(DEFAULT_CERTIFICATES);
  const [education, setEducation] = useState<EducationItem[]>(DEFAULT_EDUCATION);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSavedMessage, setLastSavedMessage] = useState<string | null>(null);

  const createdAtCacheRef = useRef<Map<string, unknown>>(new Map());
  const toastTimerRef = useRef<number | null>(null);

  const isAdmin = Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase(),
  );

  const showSavedToast = useCallback((msg: string) => {
    setLastSavedMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setLastSavedMessage(null);
    }, 2800);
  }, []);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Public & Admin Firestore listeners
  useEffect(() => {
    if (!authReady) return;

    const unsubs: (() => void)[] = [];

    // 1. Portfolio profile doc (/portfolio/profile)
    const profileRef = doc(db, 'portfolio', 'profile');
    unsubs.push(
      onSnapshot(
        profileRef,
        (snap) => {
          if (snap.exists()) {
            const d = snap.data();
            setProfile({
              ...DEFAULT_PROFILE,
              ...(d as Partial<PortfolioProfile>),
              sectionVisibility: {
                ...DEFAULT_PROFILE.sectionVisibility,
                ...(d.sectionVisibility ?? {}),
              },
              sceneSettings: {
                ...DEFAULT_PROFILE.sceneSettings,
                ...(d.sceneSettings ?? {}),
              },
              metrics:
                Array.isArray(d.metrics) && d.metrics.length > 0
                  ? d.metrics
                  : DEFAULT_PROFILE.metrics,
            });
            setHasCloudProfile(true);
          } else {
            setProfile(DEFAULT_PROFILE);
            setHasCloudProfile(false);
          }
          setIsLoadingData(false);
        },
        (error) => {
          setIsLoadingData(false);
          handleFirestoreError(error, OperationType.GET, 'portfolio/profile');
        },
      ),
    );

    // 2. Skills collection
    const skillsQ = isAdmin
      ? collection(db, 'skills')
      : query(collection(db, 'skills'), where('published', '==', true));
    unsubs.push(
      onSnapshot(
        skillsQ,
        (snap) => {
          if (snap.empty && !hasCloudProfile) {
            setSkills(DEFAULT_SKILLS);
            return;
          }
          const rows: SkillCategory[] = snap.docs.map((d) => {
            const data = d.data();
            createdAtCacheRef.current.set(`skills/${d.id}`, data.createdAt);
            return {
              id: d.id,
              name: String(data.name ?? ''),
              domain: String(data.domain ?? ''),
              experience: String(data.experience ?? ''),
              summary: String(data.summary ?? ''),
              items: Array.isArray(data.items) ? data.items.map(String) : [],
              order: Number(data.order ?? 0),
              published: Boolean(data.published),
            };
          });
          rows.sort((a, b) => a.order - b.order);
          setSkills(rows.length > 0 || hasCloudProfile ? rows : DEFAULT_SKILLS);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'skills');
        },
      ),
    );

    // 3. Projects collection
    const projectsQ = isAdmin
      ? collection(db, 'projects')
      : query(collection(db, 'projects'), where('published', '==', true));
    unsubs.push(
      onSnapshot(
        projectsQ,
        (snap) => {
          if (snap.empty && !hasCloudProfile) {
            setProjects(DEFAULT_PROJECTS);
            return;
          }
          const rows: ProjectItem[] = snap.docs.map((d) => {
            const data = d.data();
            createdAtCacheRef.current.set(`projects/${d.id}`, data.createdAt);
            return {
              id: d.id,
              title: String(data.title ?? ''),
              category:
                data.category === 'AI Systems' || data.category === 'Platform'
                  ? data.category
                  : 'Full-Stack',
              year: String(data.year ?? ''),
              role: String(data.role ?? ''),
              summary: String(data.summary ?? ''),
              description: String(data.description ?? ''),
              image: String(data.image ?? ''),
              imageAlt: String(data.imageAlt ?? ''),
              stack: Array.isArray(data.stack) ? data.stack.map(String) : [],
              architecture: Array.isArray(data.architecture)
                ? data.architecture.map(String)
                : [],
              outcomes: Array.isArray(data.outcomes)
                ? data.outcomes.map((o: { metric?: string; label?: string }) => ({
                    metric: String(o?.metric ?? ''),
                    label: String(o?.label ?? ''),
                  }))
                : [],
              liveUrl: String(data.liveUrl ?? ''),
              githubUrl: String(data.githubUrl ?? ''),
              featured: Boolean(data.featured),
              order: Number(data.order ?? 0),
              published: Boolean(data.published),
            };
          });
          rows.sort((a, b) => a.order - b.order);
          setProjects(rows.length > 0 || hasCloudProfile ? rows : DEFAULT_PROJECTS);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'projects');
        },
      ),
    );

    // 4. Certificates collection
    const certsQ = isAdmin
      ? collection(db, 'certificates')
      : query(collection(db, 'certificates'), where('published', '==', true));
    unsubs.push(
      onSnapshot(
        certsQ,
        (snap) => {
          if (snap.empty && !hasCloudProfile) {
            setCertificates(DEFAULT_CERTIFICATES);
            return;
          }
          const rows: CertificateItem[] = snap.docs.map((d) => {
            const data = d.data();
            createdAtCacheRef.current.set(`certificates/${d.id}`, data.createdAt);
            return {
              id: d.id,
              title: String(data.title ?? ''),
              program: String(data.program ?? ''),
              issuer: String(data.issuer ?? ''),
              issuedYear: String(data.issuedYear ?? ''),
              description: String(data.description ?? ''),
              credentialUrl: String(data.credentialUrl ?? ''),
              order: Number(data.order ?? 0),
              published: Boolean(data.published),
            };
          });
          rows.sort((a, b) => a.order - b.order);
          setCertificates(rows.length > 0 || hasCloudProfile ? rows : DEFAULT_CERTIFICATES);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'certificates');
        },
      ),
    );

    // 5. Education collection
    const eduQ = isAdmin
      ? collection(db, 'education')
      : query(collection(db, 'education'), where('published', '==', true));
    unsubs.push(
      onSnapshot(
        eduQ,
        (snap) => {
          if (snap.empty && !hasCloudProfile) {
            setEducation(DEFAULT_EDUCATION);
            return;
          }
          const rows: EducationItem[] = snap.docs.map((d) => {
            const data = d.data();
            createdAtCacheRef.current.set(`education/${d.id}`, data.createdAt);
            return {
              id: d.id,
              degree: String(data.degree ?? ''),
              institution: String(data.institution ?? ''),
              department: String(data.department ?? ''),
              period: String(data.period ?? ''),
              cgpa: String(data.cgpa ?? ''),
              status: String(data.status ?? ''),
              order: Number(data.order ?? 0),
              published: Boolean(data.published),
            };
          });
          rows.sort((a, b) => a.order - b.order);
          setEducation(rows.length > 0 || hasCloudProfile ? rows : DEFAULT_EDUCATION);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'education');
        },
      ),
    );

    // 6. Private Visitor Inbox (strictly subscribed ONLY when verified Admin!)
    if (isAdmin) {
      unsubs.push(
        onSnapshot(
          collection(db, 'messages'),
          (snap) => {
            const rows: ContactMessage[] = snap.docs.map((d) => {
              const data = d.data();
              createdAtCacheRef.current.set(`messages/${d.id}`, data.createdAt);
              return {
                id: d.id,
                name: String(data.name ?? ''),
                email: String(data.email ?? ''),
                subject: String(data.subject ?? ''),
                message: String(data.message ?? ''),
                status:
                  data.status === 'read' || data.status === 'archived'
                    ? data.status
                    : 'unread',
                createdAtMs: tsToMillis(data.createdAt),
              };
            });
            rows.sort((a, b) => b.createdAtMs - a.createdAtMs);
            setMessages(rows);
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, 'messages');
          },
        ),
      );
    } else {
      setMessages([]);
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [authReady, isAdmin, hasCloudProfile]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to sign in with Google.';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError(msg);
      }
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
  }, []);

  const seedFromCV = useCallback(async () => {
    if (!isAdmin) return;
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);
      const now = serverTimestamp();

      batch.set(doc(db, 'portfolio', 'profile'), {
        ...DEFAULT_PROFILE,
        updatedAt: now,
      });

      DEFAULT_SKILLS.forEach((skill) => {
        const { id, ...rest } = skill;
        batch.set(doc(db, 'skills', id), {
          ...rest,
          createdAt: createdAtCacheRef.current.get(`skills/${id}`) ?? now,
          updatedAt: now,
        });
      });

      DEFAULT_PROJECTS.forEach((project) => {
        const { id, ...rest } = project;
        batch.set(doc(db, 'projects', id), {
          ...rest,
          createdAt: createdAtCacheRef.current.get(`projects/${id}`) ?? now,
          updatedAt: now,
        });
      });

      DEFAULT_CERTIFICATES.forEach((cert) => {
        const { id, ...rest } = cert;
        batch.set(doc(db, 'certificates', id), {
          ...rest,
          createdAt: createdAtCacheRef.current.get(`certificates/${id}`) ?? now,
          updatedAt: now,
        });
      });

      DEFAULT_EDUCATION.forEach((edu) => {
        const { id, ...rest } = edu;
        batch.set(doc(db, 'education', id), {
          ...rest,
          createdAt: createdAtCacheRef.current.get(`education/${id}`) ?? now,
          updatedAt: now,
        });
      });

      await batch.commit();
      showSavedToast('CV data synced to Firestore');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'portfolio/seed');
    } finally {
      setIsSyncing(false);
    }
  }, [isAdmin, showSavedToast]);

  // Auto-seed Firestore once when Ibrahim signs in as Admin and database is still fresh
  const autoSeedTriggeredRef = useRef(false);
  useEffect(() => {
    if (authReady && isAdmin && !isLoadingData && !hasCloudProfile && !autoSeedTriggeredRef.current) {
      autoSeedTriggeredRef.current = true;
      void seedFromCV();
    }
  }, [authReady, isAdmin, isLoadingData, hasCloudProfile, seedFromCV]);

  const saveProfile = useCallback(
    async (next: PortfolioProfile) => {
      setIsSyncing(true);
      const path = 'portfolio/profile';
      try {
        const sanitized = {
          name: clampString(next.name || DEFAULT_PROFILE.name, 100),
          role: clampString(next.role || DEFAULT_PROFILE.role, 120),
          headline: clampString(next.headline || DEFAULT_PROFILE.headline, 180),
          location: clampString(next.location || DEFAULT_PROFILE.location, 120),
          availability: clampString(next.availability || DEFAULT_PROFILE.availability, 160),
          email: clampString(next.email || DEFAULT_PROFILE.email, 120),
          phone: clampString(next.phone ?? '', 40),
          showPhone: Boolean(next.showPhone),
          githubUrl: clampString(next.githubUrl ?? '', 240),
          linkedinUrl: clampString(next.linkedinUrl ?? '', 240),
          portfolioUrl: clampString(next.portfolioUrl ?? '', 240),
          resumeUrl: clampString(next.resumeUrl || DEFAULT_PROFILE.resumeUrl, 240),
          heroSummary: clampString(next.heroSummary || DEFAULT_PROFILE.heroSummary, 600),
          aboutLead: clampString(next.aboutLead || DEFAULT_PROFILE.aboutLead, 600),
          aboutBody: clampString(next.aboutBody || DEFAULT_PROFILE.aboutBody, 1200),
          metrics: next.metrics.slice(0, 4).map((m) => ({
            value: clampString(m.value, 40),
            label: clampString(m.label, 160),
          })),
          sectionVisibility: {
            about: Boolean(next.sectionVisibility.about),
            skills: Boolean(next.sectionVisibility.skills),
            projects: Boolean(next.sectionVisibility.projects),
            certificates: Boolean(next.sectionVisibility.certificates),
            education: Boolean(next.sectionVisibility.education),
            contact: Boolean(next.sectionVisibility.contact),
          },
          sceneSettings: {
            coreSpeed: Math.max(0, Math.min(2.5, Number(next.sceneSettings.coreSpeed) || 1)),
            accentTheme:
              next.sceneSettings.accentTheme === 'emerald' ||
              next.sceneSettings.accentTheme === 'amber'
                ? next.sceneSettings.accentTheme
                : 'sapphire',
            showParticles: Boolean(next.sceneSettings.showParticles),
          },
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'portfolio', 'profile'), sanitized);
        showSavedToast('Profile & site settings saved');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const saveSkill = useCallback(
    async (skill: SkillCategory, isNew = false) => {
      setIsSyncing(true);
      const id = isNew ? slugifyId(skill.name, 'skill') : skill.id;
      const path = `skills/${id}`;
      try {
        const cleanItems = skill.items
          .map((s) => clampString(s, 60))
          .filter(Boolean)
          .slice(0, 24);
        const existingCreatedAt = createdAtCacheRef.current.get(path);
        const payload = {
          name: clampString(skill.name, 80),
          domain: clampString(skill.domain, 120),
          experience: clampString(skill.experience, 60),
          summary: clampString(skill.summary, 500),
          items: cleanItems,
          order: Math.max(0, Math.min(999, Number(skill.order) || 0)),
          published: Boolean(skill.published),
          createdAt: !isNew && existingCreatedAt ? existingCreatedAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'skills', id), payload);
        showSavedToast(isNew ? 'Skill category added' : 'Skill category updated');
      } catch (error) {
        handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const deleteSkill = useCallback(
    async (id: string) => {
      setIsSyncing(true);
      const path = `skills/${id}`;
      try {
        await deleteDoc(doc(db, 'skills', id));
        showSavedToast('Skill category deleted');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const saveProject = useCallback(
    async (project: ProjectItem, isNew = false) => {
      setIsSyncing(true);
      const id = isNew ? slugifyId(project.title, 'proj') : project.id;
      const path = `projects/${id}`;
      try {
        const existingCreatedAt = createdAtCacheRef.current.get(path);
        const payload = {
          title: clampString(project.title, 120),
          category:
            project.category === 'AI Systems' || project.category === 'Platform'
              ? project.category
              : 'Full-Stack',
          year: clampString(project.year || '2025', 20),
          role: clampString(project.role || 'Full-Stack Developer', 100),
          summary: clampString(project.summary, 400),
          description: clampString(project.description || project.summary, 1500),
          image: clampString(project.image, 400),
          imageAlt: clampString(project.imageAlt || `${project.title} preview`, 240),
          stack: project.stack
            .map((s) => clampString(s, 48))
            .filter(Boolean)
            .slice(0, 16),
          architecture: project.architecture
            .map((a) => clampString(a, 240))
            .filter(Boolean)
            .slice(0, 8),
          outcomes: project.outcomes.slice(0, 4).map((o) => ({
            metric: clampString(o.metric, 40),
            label: clampString(o.label, 120),
          })),
          liveUrl: clampString(project.liveUrl, 300),
          githubUrl: clampString(project.githubUrl, 300),
          featured: Boolean(project.featured),
          order: Math.max(0, Math.min(999, Number(project.order) || 0)),
          published: Boolean(project.published),
          createdAt: !isNew && existingCreatedAt ? existingCreatedAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'projects', id), payload);
        showSavedToast(isNew ? 'Project created' : 'Project updated');
      } catch (error) {
        handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      setIsSyncing(true);
      const path = `projects/${id}`;
      try {
        await deleteDoc(doc(db, 'projects', id));
        showSavedToast('Project deleted');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const saveCertificate = useCallback(
    async (cert: CertificateItem, isNew = false) => {
      setIsSyncing(true);
      const id = isNew ? slugifyId(cert.title, 'cert') : cert.id;
      const path = `certificates/${id}`;
      try {
        const existingCreatedAt = createdAtCacheRef.current.get(path);
        const payload = {
          title: clampString(cert.title, 140),
          program: clampString(cert.program, 140),
          issuer: clampString(cert.issuer, 120),
          issuedYear: clampString(cert.issuedYear || '2024', 30),
          description: clampString(cert.description, 600),
          credentialUrl: clampString(cert.credentialUrl, 300),
          order: Math.max(0, Math.min(999, Number(cert.order) || 0)),
          published: Boolean(cert.published),
          createdAt: !isNew && existingCreatedAt ? existingCreatedAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'certificates', id), payload);
        showSavedToast(isNew ? 'Certificate added' : 'Certificate updated');
      } catch (error) {
        handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const deleteCertificate = useCallback(
    async (id: string) => {
      setIsSyncing(true);
      const path = `certificates/${id}`;
      try {
        await deleteDoc(doc(db, 'certificates', id));
        showSavedToast('Certificate deleted');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const saveEducation = useCallback(
    async (edu: EducationItem, isNew = false) => {
      setIsSyncing(true);
      const id = isNew ? slugifyId(edu.degree, 'edu') : edu.id;
      const path = `education/${id}`;
      try {
        const existingCreatedAt = createdAtCacheRef.current.get(path);
        const payload = {
          degree: clampString(edu.degree, 160),
          institution: clampString(edu.institution, 140),
          department: clampString(edu.department, 140),
          period: clampString(edu.period, 60),
          cgpa: clampString(edu.cgpa, 40),
          status: clampString(edu.status, 60),
          order: Math.max(0, Math.min(999, Number(edu.order) || 0)),
          published: Boolean(edu.published),
          createdAt: !isNew && existingCreatedAt ? existingCreatedAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'education', id), payload);
        showSavedToast(isNew ? 'Education entry added' : 'Education entry updated');
      } catch (error) {
        handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const deleteEducation = useCallback(
    async (id: string) => {
      setIsSyncing(true);
      const path = `education/${id}`;
      try {
        await deleteDoc(doc(db, 'education', id));
        showSavedToast('Education entry deleted');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const submitContactMessage = useCallback(
    async (payload: { name: string; email: string; subject: string; message: string }) => {
      const id = slugifyId(payload.name, 'msg');
      const path = `messages/${id}`;
      try {
        await setDoc(doc(db, 'messages', id), {
          name: clampString(payload.name, 100),
          email: clampString(payload.email, 140),
          subject: clampString(payload.subject || 'Portfolio Inquiry', 140),
          message: clampString(payload.message, 2000),
          status: 'unread',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [],
  );

  const updateMessageStatus = useCallback(
    async (id: string, status: MessageStatus) => {
      setIsSyncing(true);
      const path = `messages/${id}`;
      try {
        await updateDoc(doc(db, 'messages', id), {
          status,
          updatedAt: serverTimestamp(),
        });
        showSavedToast(`Message marked ${status}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const deleteMessage = useCallback(
    async (id: string) => {
      setIsSyncing(true);
      const path = `messages/${id}`;
      try {
        await deleteDoc(doc(db, 'messages', id));
        showSavedToast('Message deleted');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      } finally {
        setIsSyncing(false);
      }
    },
    [showSavedToast],
  );

  const value = useMemo<PortfolioContextValue>(
    () => ({
      user,
      authReady,
      isAdmin,
      authError,
      signInWithGoogle,
      signOutUser,
      profile,
      skills,
      projects,
      certificates,
      education,
      messages,
      hasCloudProfile,
      isLoadingData,
      isSyncing,
      lastSavedMessage,
      saveProfile,
      saveSkill,
      deleteSkill,
      saveProject,
      deleteProject,
      saveCertificate,
      deleteCertificate,
      saveEducation,
      deleteEducation,
      submitContactMessage,
      updateMessageStatus,
      deleteMessage,
      seedFromCV,
    }),
    [
      user,
      authReady,
      isAdmin,
      authError,
      signInWithGoogle,
      signOutUser,
      profile,
      skills,
      projects,
      certificates,
      education,
      messages,
      hasCloudProfile,
      isLoadingData,
      isSyncing,
      lastSavedMessage,
      saveProfile,
      saveSkill,
      deleteSkill,
      saveProject,
      deleteProject,
      saveCertificate,
      deleteCertificate,
      saveEducation,
      deleteEducation,
      submitContactMessage,
      updateMessageStatus,
      deleteMessage,
      seedFromCV,
    ],
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return ctx;
}
