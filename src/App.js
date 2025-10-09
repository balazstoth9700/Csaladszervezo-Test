import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
} from "firebase/firestore";
import {
  Home,
  Car,
  Heart,
  Baby,
  Users,
  Settings,
  Calendar,
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  X,
  Menu,
  Bell,
  Gift,
  Pill,
  Stethoscope,
  Wrench,
  DollarSign,
  LogOut,
  Edit2,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  ShoppingCart,
  Package,
  UserPlus,
  Mail,
  Repeat,
  BookOpen,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const firebaseConfig = {
  apiKey: "AIzaSyAosK2_kMLAeMkwxnoUE-_homeshFU-MWQ",
  authDomain: "family-ops-42931.firebaseapp.com",
  projectId: "family-ops-42931",
  storageBucket: "family-ops-42931.firebasestorage.app",
  messagingSenderId: "102947266229",
  appId: "1:102947266229:web:1bac25c4b894cef4de28fc",
};

// Ellenőrizzük, hogy a Firebase app már inicializálva van-e
import { getApps } from "firebase/app";
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

const getDefaultData = () => ({
  homes: [],
  vehicles: [],
  familyMembers: [],
  healthAppointments: [],
  children: [],
  tasks: [],
  notifications: [],
  devices: [],
  shoppingList: [],
  weeklyNotes: [], // ÚJ - heti jegyzetek
  subscriptions: [],
  finances: {
    loans: [],
    savingGoals: [],
    investments: [],
    transactions: [],
    accounts: [
      // ÚJ
      { id: 1, name: "Főszámla", type: "bank", subaccounts: [] },
    ],
  },
  chatMessages: [],
  familyId: null,
  invitedUsers: [],
  pets: [],
  recipes: [],
  weeklyMenu: [],
  settings: {
    activeModules: [
      "attekintes",
      "naptar",
      "otthon",
      "jarmuvek",
      "egeszseg",
      "gyerekek",
      "csalad",
      "eszkozok",
      "bevasarlas",
      "elofizetesek",
      "penzugyek",
      "chat",
    ],
    mobileBottomNav: [
      "attekintes",
      "naptar",
      "bevasarlas",
      "penzugyek",
      "chat",
    ], // ÚJ
    theme: "light",
    customCategories: {
      // ÚJ
      shopping: [
        { id: "food", name: "Élelmiszer", icon: "🥗" },
        { id: "household", name: "Háztartás", icon: "🧹" },
        { id: "clothing", name: "Ruházat", icon: "👕" },
        { id: "health", name: "Egészség", icon: "💊" },
        { id: "other", name: "Egyéb", icon: "📦" },
      ],
      finance: {
        income: [
          { id: "salary", name: "Fizetés", icon: "💼" },
          { id: "bonus", name: "Bónusz", icon: "🎁" },
          { id: "investment", name: "Befektetés", icon: "📈" },
          { id: "other", name: "Egyéb", icon: "💰" },
        ],
        expense: [
          { id: "food", name: "Élelmiszer", icon: "🍕" },
          { id: "transport", name: "Közlekedés", icon: "🚗" },
          { id: "entertainment", name: "Szórakozás", icon: "🎬" },
          { id: "bills", name: "Számlák", icon: "📄" },
          { id: "health", name: "Egészség", icon: "💊" },
          { id: "shopping", name: "Vásárlás", icon: "🛍️" },
          { id: "education", name: "Oktatás", icon: "📚" },
          { id: "other", name: "Egyéb", icon: "💸" },
        ],
      },
    },
    notificationSettings: {
      enabled: true,
      taskReminders: true,
      birthdayReminders: true,
      maintenanceReminders: true,
      vehicleReminders: true,
      healthReminders: true,
      warrantyReminders: true,
      daysBeforeReminder: 3,
    },
  },
});

const FamilyOrganizerApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState("attekintes");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [data, setData] = useState(getDefaultData());
  const [settings, setSettings] = useState(getDefaultData().settings);

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showShoppingItemModal, setShowShoppingItemModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showWeeklyNoteModal, setShowWeeklyNoteModal] = useState(false); // ÚJ

  const [showKmModal, setShowKmModal] = useState(false);
  const [showQuickServiceModal, setShowQuickServiceModal] = useState(false);
  const [showQuickMeterModal, setShowQuickMeterModal] = useState(false);
  const [showQuickMaintenanceModal, setShowQuickMaintenanceModal] =
    useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedHome, setSelectedHome] = useState(null);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });

  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const [filterAssignedTo, setFilterAssignedTo] = useState(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  // Calendar states - ÚJ
  const [calendarView, setCalendarView] = useState("month"); // 'month' vagy 'week'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeekNote, setSelectedWeekNote] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [tempUtility, setTempUtility] = useState({
    name: "",
    amount: "",
    dueDate: "",
  });
  const [tempMaintenance, setTempMaintenance] = useState({
    task: "",
    nextDate: "",
    frequency: "évente",
    customYears: 1, // ÚJ - x évente esetén
  });
  const [tempVaccination, setTempVaccination] = useState({
    name: "",
    date: "",
  });
  const [tempActivity, setTempActivity] = useState({ name: "", schedule: "" });
  const [tempServiceEvent, setTempServiceEvent] = useState({
    date: "",
    description: "",
    cost: "",
  });
  const [tempCustomField, setTempCustomField] = useState({
    label: "",
    value: "",
  });

  //Pénzügyek statek
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showSavingGoalModal, setShowSavingGoalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState("expense");
  const [financeTimeFilter, setFinanceTimeFilter] = useState("month");

  //chat statek
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // Jármű temp statek

  const [tempTire, setTempTire] = useState({
    type: "négyévszakos",
    size: "",
    brand: "",
    manufactureYear: "",
    position: "elöl",
    treadDepth: "", // ÚJ
  });
  const [tempOilChange, setTempOilChange] = useState({
    date: "",
    km: "",
    nextKm: "",
    nextDate: "",
  });
  const [tempVignette, setTempVignette] = useState({
    type: "autópálya",
    country: "Magyarország",
    validFrom: "",
    validUntil: "",
    price: "",
  });

  //Otthon temp statek
  const [tempMeter, setTempMeter] = useState({
    type: "hideg víz",
    serialNumber: "",
    unit: "m³",
    reminderEnabled: false,
    readings: [],
  });
  const [tempReading, setTempReading] = useState({ date: "", value: "" });
  const [showAllUtilities, setShowAllUtilities] = useState({});

  // Family temp statek

  const [tempDisease, setTempDisease] = useState("");
  const [tempAllergy, setTempAllergy] = useState("");
  const [tempMedication, setTempMedication] = useState({
    name: "",
    dosage: "",
  });
  const [tempBankCard, setTempBankCard] = useState({ name: "", expiry: "" });

  //elofizetesek temp stackek
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [timeFilter, setTimeFilter] = useState("week");

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const minSwipeDistance = 50;

  const [draggedModuleIndex, setDraggedModuleIndex] = useState(null);

  const [showBloodPressureModal, setShowBloodPressureModal] = useState(false);
  const [showGiftIdeaModal, setShowGiftIdeaModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [categoryType, setCategoryType] = useState("shopping");

  const [showPetModal, setShowPetModal] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [showPetVaccinationModal, setShowPetVaccinationModal] = useState(false);
  const [showPetReminderModal, setShowPetReminderModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showWeeklyMenuModal, setShowWeeklyMenuModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [tempFeeding, setTempFeeding] = useState({
    time: "",
    amount: "",
    foodType: "",
  });
  const [tempPetVaccination, setTempPetVaccination] = useState({
    name: "",
    date: "",
    nextDate: "",
  });
  const [tempIngredient, setTempIngredient] = useState({
    name: "",
    amount: "",
    unit: "db",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        loadUserData(user.uid);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setShowInstallPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const modules = getModules();
    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = modules.findIndex((m) => m.id === activeModule);
      if (isLeftSwipe && currentIndex < modules.length - 1) {
        setActiveModule(modules[currentIndex + 1].id);
      } else if (isRightSwipe && currentIndex > 0) {
        setActiveModule(modules[currentIndex - 1].id);
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetMessage("Kérlek add meg az email címed!");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage(
        "Jelszó visszaállító email elküldve! Nézd meg a postaládád."
      );
      setTimeout(() => {
        setShowPasswordReset(false);
        setResetMessage("");
        setResetEmail("");
      }, 3000);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setResetMessage("Nem található felhasználó ezzel az email címmel.");
      } else {
        setResetMessage("Hiba történt. Próbáld újra!");
      }
    }
  };

  const createOrJoinFamily = async (userId) => {
    try {
      const familyRef = await addDoc(collection(db, "families"), {
        createdBy: userId,
        createdAt: new Date().toISOString(),
        members: [
          {
            userId: userId,
            email: currentUser?.email || "unknown",
            role: "admin",
            joinedAt: new Date().toISOString(),
          },
        ],
        // Alapértelmezett megosztott adatok
        homes: [],
        vehicles: [],
        familyMembers: [],
        healthAppointments: [],
        children: [],
        tasks: [],
        notifications: [],
        devices: [],
        shoppingList: [],
        weeklyNotes: [],
        subscriptions: [],
        chatMessages: [],
        finances: {
          loans: [],
          savingGoals: [],
        },
      });
      console.log("Család létrehozva, ID:", familyRef.id);
      return familyRef.id;
    } catch (error) {
      console.error("Család létrehozási hiba:", error);
      return null;
    }
  };

  const inviteUserToFamily = async () => {
    if (!inviteEmail) {
      alert("Kérlek add meg az email címet!");
      return;
    }

    if (!data.familyId) {
      alert(
        "A család adatai még betöltés alatt vannak. Próbáld újra pár másodperc múlva!"
      );
      return;
    }

    try {
      await addDoc(collection(db, "invitations"), {
        familyId: data.familyId,
        invitedEmail: inviteEmail,
        invitedBy: currentUser.uid,
        invitedByEmail: currentUser.email,
        role: inviteRole,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      alert(`Meghívó elküldve: ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail("");
    } catch (error) {
      console.error("Meghívási hiba:", error);
      alert("Hiba történt a meghívás során!");
    }
  };

  const loadUserData = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);

      // Felhasználó saját adatai (beállítások)
      const unsubscribeUser = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();

          // MIGRÁCIÓ - Hiányzó mezők pótlása
          const defaultData = getDefaultData();

          if (!userData.settings?.mobileBottomNav) {
            userData.settings = {
              ...defaultData.settings,
              ...userData.settings,
              mobileBottomNav: defaultData.settings.mobileBottomNav,
            };
          }

          if (!userData.settings?.customCategories) {
            userData.settings.customCategories =
              defaultData.settings.customCategories;
          }

          // Családi adatok migráció
          if (userData.familyId) {
            const familyDocRef = doc(db, "families", userData.familyId);
            onSnapshot(familyDocRef, async (familyDoc) => {
              if (familyDoc.exists()) {
                const familyData = familyDoc.data();

                // Hiányzó finances mezők
                if (!familyData.finances?.accounts) {
                  familyData.finances = {
                    ...familyData.finances,
                    accounts: defaultData.finances.accounts,
                  };
                }

                // Családtagok bővítése
                if (familyData.familyMembers) {
                  familyData.familyMembers = familyData.familyMembers.map(
                    (member) => ({
                      ...member,
                      bloodPressureLog: member.bloodPressureLog || [],
                      giftIdeas: member.giftIdeas || [],
                    })
                  );
                }

                // Gyerekek bővítése
                if (familyData.children) {
                  familyData.children = familyData.children.map((child) => ({
                    ...child,
                    milestones: child.milestones || [],
                    measurements: child.measurements || [],
                  }));
                }

                setData({
                  ...defaultData,
                  ...familyData,
                  familyId: userData.familyId,
                  settings: userData.settings,
                });
              }
              setLoading(false);
            });
          }
        } else {
          // Új felhasználó
          const defaultData = getDefaultData();
          const familyId = await createOrJoinFamily(userId);
          if (familyId) {
            defaultData.familyId = familyId;
            await setDoc(userDocRef, {
              familyId,
              settings: defaultData.settings,
            });

            // Családi dokumentum létrehozása
            const familyDocRef = doc(db, "families", familyId);
            const familyDefaultData = { ...defaultData };
            delete familyDefaultData.settings;
            await setDoc(familyDocRef, familyDefaultData);
          }
          setData(defaultData);
          setLoading(false);
        }
      });

      return () => unsubscribeUser();
    } catch (error) {
      console.error("Adatok betöltési hiba:", error);
      setLoading(false);
    }
  };

  const saveUserData = async (newData) => {
    if (!currentUser || !data.familyId) return;
    try {
      // Családi adatok mentése (megosztott)
      const familyDocRef = doc(db, "families", data.familyId);
      const familyData = { ...newData };
      delete familyData.settings; // A beállítások felhasználónként külön
      delete familyData.familyId;
      await setDoc(familyDocRef, familyData, { merge: true });

      // Saját beállítások mentése
      if (newData.settings) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(
          userDocRef,
          { settings: newData.settings },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Mentési hiba:", error);
      alert("Hiba történt az adatok mentése során!");
    }
  };

  const handleLogin = async () => {
    setAuthError("");
    try {
      await signInWithEmailAndPassword(
        auth,
        loginForm.email,
        loginForm.password
      );
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setAuthError("Hibás email vagy jelszó!");
      } else if (error.code === "auth/invalid-email") {
        setAuthError("Érvénytelen email cím!");
      } else {
        setAuthError("Bejelentkezési hiba történt!");
      }
    }
  };

  const handleRegister = async () => {
    setAuthError("");
    if (loginForm.password.length < 6) {
      setAuthError("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
      return;
    }
    try {
      await createUserWithEmailAndPassword(
        auth,
        loginForm.email,
        loginForm.password
      );
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setAuthError("Ez az email cím már használatban van!");
      } else if (error.code === "auth/invalid-email") {
        setAuthError("Érvénytelen email cím!");
      } else {
        setAuthError("Regisztrációs hiba történt!");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveModule("attekintes");
    } catch (error) {
      console.error("Kijelentkezési hiba:", error);
    }
  };

  const generateRecurringTasks = async () => {
    const today = new Date();
    const recurringTasks = data.tasks.filter(
      (t) => t.recurring && t.recurring.enabled
    );

    recurringTasks.forEach(async (task) => {
      const lastCompleted = task.lastCompletedDate
        ? new Date(task.lastCompletedDate)
        : new Date(task.dueDate);
      const nextDueDate = calculateNextDueDate(lastCompleted, task.recurring);

      if (nextDueDate <= today && !task.completed) {
        const updatedTask = {
          ...task,
          dueDate: nextDueDate.toISOString().split("T")[0],
          completed: false,
        };

        const newTasks = data.tasks.map((t) =>
          t.id === task.id ? updatedTask : t
        );
        await saveUserData({ ...data, tasks: newTasks });
      }
    });
  };

  const calculateNextDueDate = (lastDate, recurringConfig) => {
    const next = new Date(lastDate);

    switch (recurringConfig.frequency) {
      case "daily":
        next.setDate(next.getDate() + (recurringConfig.interval || 1));
        break;
      case "weekly":
        next.setDate(next.getDate() + 7 * (recurringConfig.interval || 1));
        break;
      case "monthly":
        next.setMonth(next.getMonth() + (recurringConfig.interval || 1));
        break;
      case "yearly":
        next.setFullYear(next.getFullYear() + (recurringConfig.interval || 1));
        break;
    }

    return next;
  };

  useEffect(() => {
    if (isLoggedIn) {
      generateRecurringTasks();
      const interval = setInterval(generateRecurringTasks, 3600000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, data.tasks]);

  const toggleTask = async (taskId) => {
    const task = data.tasks.find((t) => t.id === taskId);
    const newCompleted = !task.completed;

    let updatedTask = {
      ...task,
      completed: newCompleted,
      lastCompletedDate: newCompleted
        ? new Date().toISOString()
        : task.lastCompletedDate,
    };

    // Ha kipipáljuk és ismétlődő feladat, akkor frissítjük a határidőt
    if (newCompleted && task.recurring?.enabled) {
      const currentDueDate = new Date(task.dueDate);
      const nextDueDate = calculateNextDueDate(currentDueDate, task.recurring);
      updatedTask = {
        ...updatedTask,
        dueDate: nextDueDate.toISOString().split("T")[0],
        completed: false, // Az új ismétlődés még nincs befejezve
      };
    }

    const newData = {
      ...data,
      tasks: data.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
    };
    setData(newData);
    await saveUserData(newData);
  };

  // === TOGGLE FUNKCIÓK MINDEN FELADAT TÍPUSHOZ ===

  const toggleUtilityPayment = async (homeId, utilityIndex) => {
    const home = data.homes.find((h) => h.id === homeId);
    const utility = home.utilities[utilityIndex];

    // Következő havi fizetési dátum számítása
    const currentDueDate = new Date(utility.dueDate);
    const nextMonth = new Date(currentDueDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const updatedUtilities = [...home.utilities];
    updatedUtilities[utilityIndex] = {
      ...utility,
      dueDate: nextMonth.toISOString().split("T")[0],
    };

    const newData = {
      ...data,
      homes: data.homes.map((h) =>
        h.id === homeId ? { ...h, utilities: updatedUtilities } : h
      ),
    };

    setData(newData);
    await saveUserData(newData);
  };

  const toggleMaintenance = async (homeId, maintenanceIndex) => {
    const home = data.homes.find((h) => h.id === homeId);
    const maint = home.maintenance[maintenanceIndex];

    // Következő karbantartás dátumának számítása
    const currentDate = new Date(maint.nextDate);
    let nextDate = new Date(currentDate);

    switch (maint.frequency) {
      case "hetente":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "havonta":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "negyedévente":
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case "félévente":
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case "évente":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case "x évente":
        nextDate.setFullYear(nextDate.getFullYear() + (maint.customYears || 1));
        break;
      case "egyszeri":
        // Egyszeri feladat - töröljük
        const updatedMaintenance = home.maintenance.filter(
          (_, idx) => idx !== maintenanceIndex
        );
        const newData = {
          ...data,
          homes: data.homes.map((h) =>
            h.id === homeId ? { ...h, maintenance: updatedMaintenance } : h
          ),
        };
        setData(newData);
        await saveUserData(newData);
        return;
      default:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    const updatedMaintenance = [...home.maintenance];
    updatedMaintenance[maintenanceIndex] = {
      ...maint,
      nextDate: nextDate.toISOString().split("T")[0],
    };

    const newData = {
      ...data,
      homes: data.homes.map((h) =>
        h.id === homeId ? { ...h, maintenance: updatedMaintenance } : h
      ),
    };

    setData(newData);
    await saveUserData(newData);
  };

  const toggleVehicleService = async (vehicleId, type) => {
    const vehicle = data.vehicles.find((v) => v.id === vehicleId);

    let updatedVehicle = { ...vehicle };
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    if (type === "service") {
      updatedVehicle.nextService = nextYear.toISOString().split("T")[0];
    } else if (type === "mot") {
      updatedVehicle.mot = nextYear.toISOString().split("T")[0];
    } else if (type === "insurance") {
      updatedVehicle.insurance = nextYear.toISOString().split("T")[0];
    }

    const newData = {
      ...data,
      vehicles: data.vehicles.map((v) =>
        v.id === vehicleId ? updatedVehicle : v
      ),
    };

    setData(newData);
    await saveUserData(newData);
  };

  const toggleHealthAppointment = async (appointmentId) => {
    // Egészségügyi időpontok egyszeriek - csak töröljük
    const newData = {
      ...data,
      healthAppointments: data.healthAppointments.filter(
        (h) => h.id !== appointmentId
      ),
    };
    setData(newData);
    await saveUserData(newData);
  };

  const markBirthdayAsViewed = async (memberId) => {
    // Születésnapok évente ismétlődnek automatikusan, csak jelezzük hogy láttuk
    // Nem kell semmit tenni, mert a getCalendarEvents minden évben újra generálja
    alert("Boldog születésnapot! 🎉");
  };

  const deleteTask = async (taskId) => {
    const newData = {
      ...data,
      tasks: data.tasks.filter((t) => t.id !== taskId),
    };
    setData(newData);
    await saveUserData(newData);
  };

  const addTask = async () => {
    if (!formData.title || !formData.dueDate) {
      alert("Kérlek töltsd ki az összes mezőt!");
      return;
    }

    const newTask = {
      ...formData,
      id: Date.now(),
      completed: false,
      recurring: formData.recurring || { enabled: false },
    };

    const newData = {
      ...data,
      tasks: [...data.tasks, newTask],
    };
    setData(newData);
    await saveUserData(newData);
    setShowTaskModal(false);
    setFormData({});
  };

  const openMemberModal = (member = null) => {
    if (member) {
      setEditingItem(member);
      setFormData({
        ...member,
        medicalInfo: member.medicalInfo || {
          bloodType: "",
          tajNumber: "",
          diseases: [],
          allergies: [],
          medications: [],
        },
        documents: member.documents || {
          idCard: "",
          drivingLicense: "",
          bankCards: [],
        },
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        relation: "",
        birthDate: "",
        nameDay: "",
        medicalInfo: {
          bloodType: "",
          tajNumber: "",
          diseases: [],
          allergies: [],
          medications: [],
        },
        documents: {
          idCard: "",
          drivingLicense: "",
          bankCards: [],
        },
      });
    }
    setShowMemberModal(true);
  };

  const openPetModal = (pet = null) => {
    if (pet) {
      setEditingItem(pet);
      setFormData({
        ...pet,
        feedingSchedule: pet.feedingSchedule || [],
        vaccinations: pet.vaccinations || [],
        reminders: pet.reminders || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        type: "kutya",
        breed: "",
        birthDate: "",
        chipNumber: "",
        weight: "",
        feedingSchedule: [],
        vaccinations: [],
        reminders: [],
        vetInfo: { name: "", phone: "", address: "" },
      });
    }
    setShowPetModal(true);
  };

  const savePet = async () => {
    if (!formData.name) {
      alert("Név kötelező!");
      return;
    }

    let newData;
    if (editingItem) {
      newData = {
        ...data,
        pets: data.pets.map((p) =>
          p.id === editingItem.id ? { ...formData, id: editingItem.id } : p
        ),
      };
    } else {
      newData = {
        ...data,
        pets: [...(data.pets || []), { ...formData, id: Date.now() }],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowPetModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deletePet = async (petId) => {
    const newData = {
      ...data,
      pets: (data.pets || []).filter((p) => p.id !== petId),
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const addFeeding = () => {
    if (!tempFeeding.time || !tempFeeding.amount) {
      alert("Idő és mennyiség kötelező!");
      return;
    }
    setFormData({
      ...formData,
      feedingSchedule: [
        ...(formData.feedingSchedule || []),
        { ...tempFeeding, id: Date.now() },
      ],
    });
    setTempFeeding({ time: "", amount: "", foodType: "" });
  };

  const removeFeeding = (index) => {
    setFormData({
      ...formData,
      feedingSchedule: formData.feedingSchedule.filter((_, i) => i !== index),
    });
  };

  const addPetVaccination = () => {
    if (!tempPetVaccination.name || !tempPetVaccination.date) {
      alert("Oltás neve és dátum kötelező!");
      return;
    }
    setFormData({
      ...formData,
      vaccinations: [
        ...(formData.vaccinations || []),
        { ...tempPetVaccination, id: Date.now() },
      ],
    });
    setTempPetVaccination({ name: "", date: "", nextDate: "" });
  };

  const removePetVaccination = (index) => {
    setFormData({
      ...formData,
      vaccinations: formData.vaccinations.filter((_, i) => i !== index),
    });
  };

  const openRecipeModal = (recipe = null) => {
    if (recipe) {
      setEditingItem(recipe);
      setFormData({
        ...recipe,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        allergens: recipe.allergens || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "főétel",
        prepTime: 30,
        servings: 4,
        difficulty: "közepes",
        ingredients: [],
        instructions: [],
        allergens: [],
        estimatedCost: 0,
        favorite: false,
      });
    }
    setShowRecipeModal(true);
  };

  const saveRecipe = async () => {
    if (
      !formData.name ||
      !formData.ingredients ||
      formData.ingredients.length === 0
    ) {
      alert("Név és legalább 1 hozzávaló kötelező!");
      return;
    }

    let newData;
    if (editingItem) {
      newData = {
        ...data,
        recipes: data.recipes.map((r) =>
          r.id === editingItem.id ? { ...formData, id: editingItem.id } : r
        ),
      };
    } else {
      newData = {
        ...data,
        recipes: [...(data.recipes || []), { ...formData, id: Date.now() }],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowRecipeModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteRecipe = async (recipeId) => {
    const newData = {
      ...data,
      recipes: (data.recipes || []).filter((r) => r.id !== recipeId),
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const addIngredient = () => {
    if (!tempIngredient.name || !tempIngredient.amount) {
      alert("Hozzávaló neve és mennyiség kötelező!");
      return;
    }
    setFormData({
      ...formData,
      ingredients: [
        ...(formData.ingredients || []),
        { ...tempIngredient, id: Date.now() },
      ],
    });
    setTempIngredient({ name: "", amount: "", unit: "db" });
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const addRecipeToShoppingList = async (recipeId) => {
    const recipe = data.recipes.find((r) => r.id === recipeId);
    if (!recipe || !recipe.ingredients) return;

    const newItems = recipe.ingredients.map((ing) => ({
      id: Date.now() + Math.random(),
      name: `${ing.name} (${ing.amount} ${ing.unit})`,
      quantity: 1,
      category: "food",
      priority: "normal",
      checked: false,
      addedBy: currentUser?.email,
      addedAt: new Date().toISOString(),
    }));

    const newData = {
      ...data,
      shoppingList: [...(data.shoppingList || []), ...newItems],
    };

    setData(newData);
    await saveUserData(newData);
    alert(`${recipe.name} hozzávalói hozzáadva a bevásárlólistához!`);
  };

  const saveMember = async () => {
    if (!formData.name || !formData.birthDate) {
      alert("Név és születési dátum kötelező!");
      return;
    }

    let newData;
    if (editingItem) {
      newData = {
        ...data,
        familyMembers: data.familyMembers.map((m) =>
          m.id === editingItem.id ? { ...formData, id: editingItem.id } : m
        ),
      };
    } else {
      newData = {
        ...data,
        familyMembers: [...data.familyMembers, { ...formData, id: Date.now() }],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowMemberModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteMember = async (memberId) => {
    const newData = {
      ...data,
      familyMembers: data.familyMembers.filter((m) => m.id !== memberId),
      children: data.children.filter((c) => c.memberId !== memberId),
      healthAppointments: data.healthAppointments.filter(
        (h) => h.personId !== memberId
      ),
      tasks: data.tasks.map((t) =>
        t.assignedTo === memberId ? { ...t, assignedTo: null } : t
      ),
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  // === VÉRNYOMÁS NAPLÓ ===
  const openBloodPressureModal = (member) => {
    setSelectedMember(member);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      systolic: "",
      diastolic: "",
      pulse: "",
      notes: "",
    });
    setShowBloodPressureModal(true);
  };

  const saveBloodPressure = async () => {
    if (!formData.systolic || !formData.diastolic) {
      alert("Szisztolés és diasztolés érték kötelező!");
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: formData.date,
      systolic: parseInt(formData.systolic),
      diastolic: parseInt(formData.diastolic),
      pulse: formData.pulse ? parseInt(formData.pulse) : null,
      notes: formData.notes,
      addedBy: currentUser.email,
    };

    const newData = {
      ...data,
      familyMembers: data.familyMembers.map((m) =>
        m.id === selectedMember.id
          ? {
              ...m,
              bloodPressureLog: [...(m.bloodPressureLog || []), newEntry],
            }
          : m
      ),
    };

    setData(newData);
    await saveUserData(newData);
    setShowBloodPressureModal(false);
    setFormData({});
    setSelectedMember(null);
  };

  const deleteBloodPressure = async (memberId, entryId) => {
    const newData = {
      ...data,
      familyMembers: data.familyMembers.map((m) =>
        m.id === memberId
          ? {
              ...m,
              bloodPressureLog: (m.bloodPressureLog || []).filter(
                (entry) => entry.id !== entryId
              ),
            }
          : m
      ),
    };
    setData(newData);
    await saveUserData(newData);
  };

  // === AJÁNDÉK ÖTLETEK ===
  const openGiftIdeaModal = (member) => {
    setSelectedMember(member);
    setFormData({
      occasion: "birthday",
      name: "",
      link: "",
      price: "",
      notes: "",
    });
    setShowGiftIdeaModal(true);
  };

  const saveGiftIdea = async () => {
    if (!formData.name) {
      alert("Ajándék neve kötelező!");
      return;
    }

    const newIdea = {
      id: Date.now(),
      occasion: formData.occasion,
      name: formData.name,
      link: formData.link,
      price: formData.price ? parseFloat(formData.price) : null,
      notes: formData.notes,
      addedBy: currentUser.email,
      addedAt: new Date().toISOString(),
    };

    const newData = {
      ...data,
      familyMembers: data.familyMembers.map((m) =>
        m.id === selectedMember.id
          ? {
              ...m,
              giftIdeas: [...(m.giftIdeas || []), newIdea],
            }
          : m
      ),
    };

    setData(newData);
    await saveUserData(newData);
    setShowGiftIdeaModal(false);
    setFormData({});
    setSelectedMember(null);
  };

  const deleteGiftIdea = async (memberId, ideaId) => {
    const newData = {
      ...data,
      familyMembers: data.familyMembers.map((m) =>
        m.id === memberId
          ? {
              ...m,
              giftIdeas: (m.giftIdeas || []).filter(
                (idea) => idea.id !== ideaId
              ),
            }
          : m
      ),
    };
    setData(newData);
    await saveUserData(newData);
  };

  // === GYEREKEK - MÉRFÖLDKÖVEK ===
  const openMilestoneModal = (child) => {
    setSelectedChild(child);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      title: "",
      description: "",
      category: "physical",
    });
    setShowMilestoneModal(true);
  };

  const saveMilestone = async () => {
    if (!formData.title) {
      alert("Esemény neve kötelező!");
      return;
    }

    const newMilestone = {
      id: Date.now(),
      date: formData.date,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      addedBy: currentUser.email,
    };

    const newData = {
      ...data,
      children: data.children.map((c) =>
        c.id === selectedChild.id
          ? {
              ...c,
              milestones: [...(c.milestones || []), newMilestone],
            }
          : c
      ),
    };

    setData(newData);
    await saveUserData(newData);
    setShowMilestoneModal(false);
    setFormData({});
    setSelectedChild(null);
  };

  const deleteMilestone = async (childId, milestoneId) => {
    const newData = {
      ...data,
      children: data.children.map((c) =>
        c.id === childId
          ? {
              ...c,
              milestones: (c.milestones || []).filter(
                (m) => m.id !== milestoneId
              ),
            }
          : c
      ),
    };
    setData(newData);
    await saveUserData(newData);
  };

  // === GYEREKEK - MÉRÉSEK ===
  const openMeasurementModal = (child) => {
    setSelectedChild(child);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      height: "",
      weight: "",
      headCircumference: "",
      notes: "",
    });
    setShowMeasurementModal(true);
  };

  const saveMeasurement = async () => {
    if (!formData.height && !formData.weight) {
      alert("Add meg legalább a magasságot vagy a súlyt!");
      return;
    }

    const newMeasurement = {
      id: Date.now(),
      date: formData.date,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      headCircumference: formData.headCircumference
        ? parseFloat(formData.headCircumference)
        : null,
      notes: formData.notes,
      addedBy: currentUser.email,
    };

    const newData = {
      ...data,
      children: data.children.map((c) =>
        c.id === selectedChild.id
          ? {
              ...c,
              measurements: [...(c.measurements || []), newMeasurement],
            }
          : c
      ),
    };

    setData(newData);
    await saveUserData(newData);
    setShowMeasurementModal(false);
    setFormData({});
    setSelectedChild(null);
  };

  const deleteMeasurement = async (childId, measurementId) => {
    const newData = {
      ...data,
      children: data.children.map((c) =>
        c.id === childId
          ? {
              ...c,
              measurements: (c.measurements || []).filter(
                (m) => m.id !== measurementId
              ),
            }
          : c
      ),
    };
    setData(newData);
    await saveUserData(newData);
  };

  // === PÉNZÜGYEK - SZÁMLÁK ===
  const openAccountModal = (account = null) => {
    if (account) {
      setEditingItem(account);
      setFormData(account);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        type: "bank",
        balance: 0,
        currency: "HUF",
        subaccounts: [],
      });
    }
    setShowAccountModal(true);
  };

  const saveAccount = async () => {
    if (!formData.name) {
      alert("Számla neve kötelező!");
      return;
    }

    let newData;
    const accounts = data.finances?.accounts || [];

    if (editingItem) {
      newData = {
        ...data,
        finances: {
          ...data.finances,
          accounts: accounts.map((acc) =>
            acc.id === editingItem.id
              ? { ...formData, id: editingItem.id }
              : acc
          ),
        },
      };
    } else {
      newData = {
        ...data,
        finances: {
          ...data.finances,
          accounts: [...accounts, { ...formData, id: Date.now() }],
        },
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowAccountModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteAccount = async (accountId) => {
    const newData = {
      ...data,
      finances: {
        ...data.finances,
        accounts: (data.finances?.accounts || []).filter(
          (acc) => acc.id !== accountId
        ),
      },
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const addSubaccount = () => {
    if (!tempCustomField.label) {
      alert("Alszámla neve kötelező!");
      return;
    }
    setFormData({
      ...formData,
      subaccounts: [
        ...(formData.subaccounts || []),
        {
          id: Date.now(),
          name: tempCustomField.label,
          balance: parseFloat(tempCustomField.value) || 0,
        },
      ],
    });
    setTempCustomField({ label: "", value: "" });
  };

  const removeSubaccount = (index) => {
    setFormData({
      ...formData,
      subaccounts: formData.subaccounts.filter((_, i) => i !== index),
    });
  };

  // === KATEGÓRIA TESTRESZABÁS ===
  const openCategoryModal = (type) => {
    setCategoryType(type);
    setFormData({ name: "", icon: "📦" });
    setShowCategoryModal(true);
  };

  const saveCategory = async () => {
    if (!formData.name) {
      alert("Kategória neve kötelező!");
      return;
    }

    const newCategory = {
      id: Date.now().toString(),
      name: formData.name,
      icon: formData.icon || "📦",
    };

    let newSettings = { ...settings };

    if (categoryType === "shopping") {
      newSettings.customCategories.shopping = [
        ...(newSettings.customCategories?.shopping || []),
        newCategory,
      ];
    } else if (categoryType === "finance-income") {
      newSettings.customCategories.finance.income = [
        ...(newSettings.customCategories?.finance?.income || []),
        newCategory,
      ];
    } else if (categoryType === "finance-expense") {
      newSettings.customCategories.finance.expense = [
        ...(newSettings.customCategories?.finance?.expense || []),
        newCategory,
      ];
    }

    await updateSettings(newSettings);
    setShowCategoryModal(false);
    setFormData({});
  };

  const deleteCategory = async (type, categoryId) => {
    let newSettings = { ...settings };

    if (type === "shopping") {
      newSettings.customCategories.shopping =
        newSettings.customCategories.shopping.filter(
          (c) => c.id !== categoryId
        );
    } else if (type === "finance-income") {
      newSettings.customCategories.finance.income =
        newSettings.customCategories.finance.income.filter(
          (c) => c.id !== categoryId
        );
    } else if (type === "finance-expense") {
      newSettings.customCategories.finance.expense =
        newSettings.customCategories.finance.expense.filter(
          (c) => c.id !== categoryId
        );
    }

    await updateSettings(newSettings);
  };

  const openHomeModal = (home = null) => {
    if (home) {
      setEditingItem(home);
      setFormData({
        ...home,
        utilities: home.utilities || [],
        maintenance: home.maintenance || [],
        meters: home.meters || [], // ÚJ
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        address: "",
        type: "lakás",
        utilities: [],
        maintenance: [],
        meters: [], // ÚJ
      });
    }
    setShowHomeModal(true);
  };

  const addUtility = () => {
    if (!tempUtility.name || !tempUtility.amount || !tempUtility.dueDate) {
      alert("Minden mező kitöltése kötelező!");
      return;
    }
    setFormData({
      ...formData,
      utilities: [
        ...(formData.utilities || []),
        { ...tempUtility, amount: parseFloat(tempUtility.amount) },
      ],
    });
    setTempUtility({ name: "", amount: "", dueDate: "" });
  };

  const removeUtility = (index) => {
    setFormData({
      ...formData,
      utilities: formData.utilities.filter((_, i) => i !== index),
    });
  };

  const addMaintenance = () => {
    if (!tempMaintenance.task || !tempMaintenance.nextDate) {
      alert("Minden mező kitöltése kötelező!");
      return;
    }
    setFormData({
      ...formData,
      maintenance: [...(formData.maintenance || []), tempMaintenance],
    });
    setTempMaintenance({
      task: "",
      nextDate: "",
      frequency: "évente",
      customYears: 1,
    });
  };

  const removeMaintenance = (index) => {
    setFormData({
      ...formData,
      maintenance: formData.maintenance.filter((_, i) => i !== index),
    });
  };

  const saveHome = async () => {
    if (!formData.name) {
      alert("Név kötelező!");
      return;
    }

    let newData;
    if (editingItem) {
      newData = {
        ...data,
        homes: data.homes.map((h) =>
          h.id === editingItem.id ? { ...formData, id: editingItem.id } : h
        ),
      };
    } else {
      newData = {
        ...data,
        homes: [...data.homes, { ...formData, id: Date.now() }],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowHomeModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteHome = async (homeId) => {
    const newData = {
      ...data,
      homes: data.homes.filter((h) => h.id !== homeId),
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const openVehicleModal = (vehicle = null) => {
    if (vehicle) {
      setEditingItem(vehicle);
      setFormData({
        ...vehicle,
        serviceHistory: vehicle.serviceHistory || [],
        tires: vehicle.tires || [], // MÓDOSÍTVA: már tömb lesz
        oilChanges: vehicle.oilChanges || [], // ÚJ
        vignettes: vehicle.vignettes || [], // ÚJ
        kmReminder: vehicle.kmReminder || { enabled: false, lastRecorded: 0 }, // ÚJ
      });
    } else {
      setEditingItem(null);
      setFormData({
        type: "autó",
        name: "",
        plate: "",
        nextService: "",
        mot: "",
        insurance: "",
        km: 0,
        serviceHistory: [],
        tires: [], // MÓDOSÍTVA
        oilChanges: [], // ÚJ
        vignettes: [], // ÚJ
        kmReminder: { enabled: false, lastRecorded: 0 }, // ÚJ
      });
    }
    setShowVehicleModal(true);
  };

  const addServiceEvent = () => {
    if (!tempServiceEvent.date || !tempServiceEvent.description) {
      alert("Dátum és leírás kötelező!");
      return;
    }
    setFormData({
      ...formData,
      serviceHistory: [
        ...(formData.serviceHistory || []),
        {
          ...tempServiceEvent,
          cost: parseFloat(tempServiceEvent.cost) || 0,
        },
      ],
    });
    setTempServiceEvent({ date: "", description: "", cost: "" });
  };

  const removeServiceEvent = (index) => {
    setFormData({
      ...formData,
      serviceHistory: formData.serviceHistory.filter((_, i) => i !== index),
    });
  };

  const saveVehicle = async () => {
    if (!formData.name || !formData.plate) {
      alert("Név és rendszám kötelező!");
      return;
    }

    let newData;
    if (editingItem) {
      newData = {
        ...data,
        vehicles: data.vehicles.map((v) =>
          v.id === editingItem.id ? { ...formData, id: editingItem.id } : v
        ),
      };
    } else {
      newData = {
        ...data,
        vehicles: [...data.vehicles, { ...formData, id: Date.now() }],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowVehicleModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteVehicle = async (vehicleId) => {
    const newData = {
      ...data,
      vehicles: data.vehicles.filter((v) => v.id !== vehicleId),
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const addTire = () => {
    if (!tempTire.size) {
      alert("Méret kötelező!");
      return;
    }
    setFormData({
      ...formData,
      tires: [...(formData.tires || []), { ...tempTire, id: Date.now() }],
    });
    setTempTire({
      type: "négyévszakos",
      size: "",
      brand: "",
      manufactureYear: "",
      position: "elöl",
      treadDepth: "",
    });
  };

  const removeTire = (index) => {
    setFormData({
      ...formData,
      tires: formData.tires.filter((_, i) => i !== index),
    });
  };

  const addOilChange = () => {
    if (!tempOilChange.date || !tempOilChange.km) {
      alert("Dátum és km állás kötelező!");
      return;
    }
    const km = parseInt(tempOilChange.km);
    const newOilChange = {
      ...tempOilChange,
      km: km,
      nextKm: tempOilChange.nextKm
        ? parseInt(tempOilChange.nextKm)
        : km + 10000,
      nextDate:
        tempOilChange.nextDate ||
        new Date(
          new Date(tempOilChange.date).getTime() + 365 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
      id: Date.now(),
    };
    setFormData({
      ...formData,
      oilChanges: [...(formData.oilChanges || []), newOilChange],
    });
    setTempOilChange({ date: "", km: "", nextKm: "", nextDate: "" });
  };

  const removeOilChange = (index) => {
    setFormData({
      ...formData,
      oilChanges: formData.oilChanges.filter((_, i) => i !== index),
    });
  };

  const addVignette = () => {
    if (!tempVignette.validFrom || !tempVignette.validUntil) {
      alert("Érvényességi időszak kötelező!");
      return;
    }
    setFormData({
      ...formData,
      vignettes: [
        ...(formData.vignettes || []),
        { ...tempVignette, id: Date.now() },
      ],
    });
    setTempVignette({
      type: "autópálya",
      country: "Magyarország",
      validFrom: "",
      validUntil: "",
      price: "",
    });
  };

  const removeVignette = (index) => {
    setFormData({
      ...formData,
      vignettes: formData.vignettes.filter((_, i) => i !== index),
    });
  };

  const quickAddService = async (vehicleId) => {
    const vehicle = data.vehicles.find((v) => v.id === vehicleId);
    const date = new Date().toISOString().split("T")[0];
    const description = prompt("Szervíz leírása:");
    if (!description) return;

    const cost = prompt("Költség (Ft):");

    const updatedVehicle = {
      ...vehicle,
      serviceHistory: [
        ...(vehicle.serviceHistory || []),
        { date, description, cost: parseFloat(cost) || 0, id: Date.now() },
      ],
    };

    const newData = {
      ...data,
      vehicles: data.vehicles.map((v) =>
        v.id === vehicleId ? updatedVehicle : v
      ),
    };
    setData(newData);
    await saveUserData(newData);
    alert("Szervíz esemény hozzáadva!");
  };

  const quickRecordKm = async (vehicleId) => {
    const vehicle = data.vehicles.find((v) => v.id === vehicleId);
    const newKm = prompt(
      `Aktuális km állás (jelenlegi: ${vehicle.km || 0} km):`
    );
    if (!newKm) return;

    const updatedVehicle = {
      ...vehicle,
      km: parseInt(newKm),
      kmReminder: {
        ...vehicle.kmReminder,
        lastRecorded: new Date().toISOString(),
      },
    };

    const newData = {
      ...data,
      vehicles: data.vehicles.map((v) =>
        v.id === vehicleId ? updatedVehicle : v
      ),
    };
    setData(newData);
    await saveUserData(newData);
    alert(`Km állás frissítve: ${newKm} km`);
  };

  const openHealthModal = (appointment = null) => {
    if (appointment) {
      setEditingItem(appointment);
      setFormData(appointment);
    } else {
      setEditingItem(null);
      setFormData({
        personId: data.familyMembers[0]?.id || "",
        type: "",
        date: "",
        location: "",
        phone: "",
      });
    }
    setShowHealthModal(true);
  };

  const saveHealthAppointment = async () => {
    if (!formData.type || !formData.date) {
      alert("Típus és dátum kötelező!");
      return;
    }

    let newData;
    if (editingItem) {
      newData = {
        ...data,
        healthAppointments: data.healthAppointments.map((h) =>
          h.id === editingItem.id ? { ...formData, id: editingItem.id } : h
        ),
      };
    } else {
      newData = {
        ...data,
        healthAppointments: [
          ...data.healthAppointments,
          { ...formData, id: Date.now() },
        ],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowHealthModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteHealthAppointment = async (appointmentId) => {
    const newData = {
      ...data,
      healthAppointments: data.healthAppointments.filter(
        (h) => h.id !== appointmentId
      ),
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const openChildModal = (child = null) => {
    if (child) {
      setEditingItem(child);
      setFormData({
        ...child,
        vaccinations: child.vaccinations || [],
        activities: child.activities || [],
        customFields: child.customFields || [],
      });
    } else {
      setEditingItem(null);
      setFormData({
        memberId: data.familyMembers[0]?.id || "",
        vaccinations: [],
        activities: [],
        customFields: [],
      });
    }
    setShowChildModal(true);
  };

  const addVaccination = () => {
    if (!tempVaccination.name || !tempVaccination.date) {
      alert("Minden mező kitöltése kötelező!");
      return;
    }
    setFormData({
      ...formData,
      vaccinations: [
        ...(formData.vaccinations || []),
        { ...tempVaccination, status: "completed" },
      ],
    });
    setTempVaccination({ name: "", date: "" });
  };

  const removeVaccination = (index) => {
    setFormData({
      ...formData,
      vaccinations: formData.vaccinations.filter((_, i) => i !== index),
    });
  };

  const addActivity = () => {
    if (!tempActivity.name || !tempActivity.schedule) {
      alert("Minden mező kitöltése kötelező!");
      return;
    }
    setFormData({
      ...formData,
      activities: [...(formData.activities || []), tempActivity],
    });
    setTempActivity({ name: "", schedule: "" });
  };

  const removeActivity = (index) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter((_, i) => i !== index),
    });
  };

  const addCustomField = () => {
    if (!tempCustomField.label || !tempCustomField.value) {
      alert("Minden mező kitöltése kötelező!");
      return;
    }
    setFormData({
      ...formData,
      customFields: [...(formData.customFields || []), tempCustomField],
    });
    setTempCustomField({ label: "", value: "" });
  };

  const removeCustomField = (index) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.filter((_, i) => i !== index),
    });
  };

  const saveChild = async () => {
    if (!formData.memberId) {
      alert("Válassz egy családtagot!");
      return;
    }

    let newData;
    if (editingItem) {
      newData = {
        ...data,
        children: data.children.map((c) =>
          c.id === editingItem.id ? { ...formData, id: editingItem.id } : c
        ),
      };
    } else {
      newData = {
        ...data,
        children: [...data.children, { ...formData, id: Date.now() }],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowChildModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteChild = async (childId) => {
    const newData = {
      ...data,
      children: data.children.filter((c) => c.id !== childId),
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const openDeviceModal = (device = null) => {
    if (device) {
      setEditingItem(device);
      setFormData(device);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "háztartási gép",
        brand: "",
        model: "",
        purchaseDate: "",
        warrantyExpiry: "",
        price: 0,
        location: "",
        notes: "",
      });
    }
    setShowDeviceModal(true);
  };

  const saveDevice = async () => {
    if (!formData.name) {
      alert("Az eszköz neve kötelező!");
      return;
    }

    let newData;
    if (editingItem) {
      newData = {
        ...data,
        devices: data.devices.map((d) =>
          d.id === editingItem.id ? { ...formData, id: editingItem.id } : d
        ),
      };
    } else {
      newData = {
        ...data,
        devices: [...(data.devices || []), { ...formData, id: Date.now() }],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowDeviceModal(false);
    setFormData({});
    setEditingItem(null);
  };

  // === HITELEK ===

  const openLoanModal = (loan = null) => {
    if (loan) {
      setEditingItem(loan);
      setFormData(loan);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        lender: "",
        principal: 0,
        currentBalance: 0,
        monthlyPayment: 0,
        interestRate: 0,
        thm: 0,
        startDate: "",
        endDate: "",
        paymentDay: "",
        reminderEnabled: true,
        notes: "",
      });
    }
    setShowLoanModal(true);
  };

  const saveLoan = async () => {
    if (!formData.name || !formData.principal || !formData.monthlyPayment) {
      alert("Név, kölcsönösszeg és havi törlesztő kötelező!");
      return;
    }

    let newData;
    const loans = data.finances?.loans || [];

    if (editingItem) {
      newData = {
        ...data,
        finances: {
          ...data.finances,
          loans: loans.map((l) =>
            l.id === editingItem.id ? { ...formData, id: editingItem.id } : l
          ),
        },
      };
    } else {
      newData = {
        ...data,
        finances: {
          ...data.finances,
          loans: [...loans, { ...formData, id: Date.now() }],
        },
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowLoanModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteLoan = async (loanId) => {
    const newData = {
      ...data,
      finances: {
        ...data.finances,
        loans: (data.finances?.loans || []).filter((l) => l.id !== loanId),
      },
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  // === MEGTAKARÍTÁSI CÉLOK ===

  const openSavingGoalModal = (goal = null) => {
    if (goal) {
      setEditingItem(goal);
      setFormData(goal);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        targetAmount: 0,
        currentAmount: 0,
        deadline: "",
        category: "vacation",
        notes: "",
        deposits: [],
      });
    }
    setShowSavingGoalModal(true);
  };

  const saveSavingGoal = async () => {
    if (!formData.name || !formData.targetAmount) {
      alert("Név és célösszeg kötelező!");
      return;
    }

    let newData;
    const goals = data.finances?.savingGoals || [];

    if (editingItem) {
      newData = {
        ...data,
        finances: {
          ...data.finances,
          savingGoals: goals.map((g) =>
            g.id === editingItem.id ? { ...formData, id: editingItem.id } : g
          ),
        },
      };
    } else {
      newData = {
        ...data,
        finances: {
          ...data.finances,
          savingGoals: [
            ...goals,
            { ...formData, id: Date.now(), deposits: [] },
          ],
        },
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowSavingGoalModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteSavingGoal = async (goalId) => {
    const newData = {
      ...data,
      finances: {
        ...data.finances,
        savingGoals: (data.finances?.savingGoals || []).filter(
          (g) => g.id !== goalId
        ),
      },
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const addDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert("Adj meg egy érvényes összeget!");
      return;
    }

    const amount = parseFloat(depositAmount);
    const goals = data.finances?.savingGoals || [];

    const updatedGoals = goals.map((goal) => {
      if (goal.id === selectedGoal.id) {
        return {
          ...goal,
          currentAmount: (goal.currentAmount || 0) + amount,
          deposits: [
            ...(goal.deposits || []),
            {
              id: Date.now(),
              amount: amount,
              date: new Date().toISOString(),
              addedBy: currentUser.email,
            },
          ],
        };
      }
      return goal;
    });

    const newData = {
      ...data,
      finances: {
        ...data.finances,
        savingGoals: updatedGoals,
      },
    };

    setData(newData);
    await saveUserData(newData);
    setShowDepositModal(false);
    setDepositAmount("");
    setSelectedGoal(null);
  };

  // === CHAT FUNKCIÓK ===

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: currentUser.email,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const newData = {
      ...data,
      chatMessages: [...(data.chatMessages || []), message],
    };

    setData(newData);
    await saveUserData(newData);
    setNewMessage("");

    // Scroll to bottom after sending
    setTimeout(() => {
      const chatContainer = document.getElementById("chat-messages-container");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  };

  const markMessagesAsRead = async () => {
    const messages = data.chatMessages || [];
    const hasUnread = messages.some(
      (m) => !m.read && m.sender !== currentUser.email
    );

    if (!hasUnread) return;

    const updatedMessages = messages.map((msg) => ({
      ...msg,
      read: msg.sender === currentUser.email ? msg.read : true,
    }));

    const newData = {
      ...data,
      chatMessages: updatedMessages,
    };

    setData(newData);
    await saveUserData(newData);
  };

  const deleteMessage = async (messageId) => {
    const newData = {
      ...data,
      chatMessages: (data.chatMessages || []).filter((m) => m.id !== messageId),
    };
    setData(newData);
    await saveUserData(newData);
  };

  const openSubscriptionModal = (subscription = null) => {
    if (subscription) {
      setEditingItem(subscription);
      setFormData(subscription);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "streaming",
        monthlyPrice: 0,
        currency: "HUF",
        billingDate: "",
        trialEnd: "",
        contractEnd: "", // ÚJ
        autoRenew: true, // ÚJ
        notes: "",
        active: true,
      });
    }
    setShowSubscriptionModal(true);
  };

  const saveSubscription = async () => {
    if (!formData.name || !formData.monthlyPrice) {
      alert("Név és havi díj kötelező!");
      return;
    }

    let newData;
    if (editingItem) {
      newData = {
        ...data,
        subscriptions: data.subscriptions.map((s) =>
          s.id === editingItem.id ? { ...formData, id: editingItem.id } : s
        ),
      };
    } else {
      newData = {
        ...data,
        subscriptions: [
          ...(data.subscriptions || []),
          { ...formData, id: Date.now() },
        ],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowSubscriptionModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteSubscription = async (subscriptionId) => {
    const newData = {
      ...data,
      subscriptions: data.subscriptions.filter((s) => s.id !== subscriptionId),
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const toggleSubscription = async (subscriptionId) => {
    const newData = {
      ...data,
      subscriptions: data.subscriptions.map((s) =>
        s.id === subscriptionId ? { ...s, active: !s.active } : s
      ),
    };
    setData(newData);
    await saveUserData(newData);
  };

  // === JÁRMŰVEK - GYORSGOMBOK ===
  const openKmModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({ km: vehicle.km || 0 });
    setShowKmModal(true);
  };

  const saveKm = async () => {
    if (!formData.km || formData.km < 0) {
      alert("Add meg a km állást!");
      return;
    }

    const updatedVehicle = {
      ...selectedVehicle,
      km: parseInt(formData.km),
      kmReminder: {
        ...selectedVehicle.kmReminder,
        lastRecorded: new Date().toISOString(),
      },
    };

    const newData = {
      ...data,
      vehicles: data.vehicles.map((v) =>
        v.id === selectedVehicle.id ? updatedVehicle : v
      ),
    };

    setData(newData);
    await saveUserData(newData);
    setShowKmModal(false);
    setFormData({});
    setSelectedVehicle(null);
  };

  const openQuickServiceModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      cost: "",
    });
    setShowQuickServiceModal(true);
  };

  const saveQuickService = async () => {
    if (!formData.description) {
      alert("Szervíz leírása kötelező!");
      return;
    }

    const updatedVehicle = {
      ...selectedVehicle,
      serviceHistory: [
        ...(selectedVehicle.serviceHistory || []),
        {
          date: formData.date,
          description: formData.description,
          cost: parseFloat(formData.cost) || 0,
          id: Date.now(),
        },
      ],
    };

    const newData = {
      ...data,
      vehicles: data.vehicles.map((v) =>
        v.id === selectedVehicle.id ? updatedVehicle : v
      ),
    };

    setData(newData);
    await saveUserData(newData);
    setShowQuickServiceModal(false);
    setFormData({});
    setSelectedVehicle(null);
  };

  // GUMIABRONCS ELLENŐRZÉS
  const checkTireCondition = (tire) => {
    const warnings = [];
    const currentYear = new Date().getFullYear();

    if (tire.manufactureYear) {
      const age = currentYear - parseInt(tire.manufactureYear);
      if (age >= 5) {
        warnings.push({
          type: "age",
          message: `${age} éves - csere ajánlott!`,
        });
      }
    }

    if (tire.treadDepth && parseFloat(tire.treadDepth) <= 1.6) {
      warnings.push({
        type: "depth",
        message: "Minimális profilmélység elérve!",
      });
    } else if (tire.treadDepth && parseFloat(tire.treadDepth) <= 3) {
      warnings.push({
        type: "depth_warning",
        message: "Alacsony profilmélység!",
      });
    }

    return warnings;
  };

  // === OTTHON - GYORSGOMBOK ===
  const openQuickMeterModal = (home, meterIndex) => {
    setSelectedHome(home);
    setFormData({
      meterIndex: meterIndex,
      date: new Date().toISOString().split("T")[0],
      value: "",
    });
    setShowQuickMeterModal(true);
  };

  const saveQuickMeter = async () => {
    if (!formData.value) {
      alert("Add meg a mérőállást!");
      return;
    }

    const updatedMeters = [...selectedHome.meters];
    updatedMeters[formData.meterIndex].readings.unshift({
      date: formData.date,
      value: parseFloat(formData.value),
      id: Date.now(),
    });

    const newData = {
      ...data,
      homes: data.homes.map((h) =>
        h.id === selectedHome.id ? { ...h, meters: updatedMeters } : h
      ),
    };

    setData(newData);
    await saveUserData(newData);
    setShowQuickMeterModal(false);
    setFormData({});
    setSelectedHome(null);
  };

  const openQuickMaintenanceModal = (home) => {
    setSelectedHome(home);
    setFormData({
      task: "",
      nextDate: new Date().toISOString().split("T")[0],
      frequency: "egyszeri",
      customYears: 1,
    });
    setShowQuickMaintenanceModal(true);
  };

  const saveQuickMaintenance = async () => {
    if (!formData.task || !formData.nextDate) {
      alert("Feladat és dátum kötelező!");
      return;
    }

    const newData = {
      ...data,
      homes: data.homes.map((h) =>
        h.id === selectedHome.id
          ? {
              ...h,
              maintenance: [
                ...(h.maintenance || []),
                { ...formData, id: Date.now() },
              ],
            }
          : h
      ),
    };

    setData(newData);
    await saveUserData(newData);
    setShowQuickMaintenanceModal(false);
    setFormData({});
    setSelectedHome(null);
  };

  // === PÉNZÜGYI FORMÁZÓ FÜGGVÉNYEK ===
  const formatCurrency = (amount, currency = "HUF") => {
    const symbols = { HUF: "Ft", EUR: "€", USD: "$" };
    const formatted = Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return currency === "HUF"
      ? `${formatted} ${symbols[currency]}`
      : `${symbols[currency]} ${formatted}`;
  };

  const convertToHUF = (amount, currency) => {
    const rates = { HUF: 1, EUR: 400, USD: 370 };
    return amount * rates[currency];
  };

  // === BEFEKTETÉSEK ===
  const openInvestmentModal = (investment = null) => {
    if (investment) {
      setEditingItem(investment);
      setFormData(investment);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        type: "stock",
        amount: 0,
        currency: "HUF",
        purchaseDate: "",
        currentValue: 0,
        notes: "",
      });
    }
    setShowInvestmentModal(true);
  };

  const saveInvestment = async () => {
    if (!formData.name || !formData.amount) {
      alert("Név és összeg kötelező!");
      return;
    }

    let newData;
    const investments = data.finances?.investments || [];

    if (editingItem) {
      newData = {
        ...data,
        finances: {
          ...data.finances,
          investments: investments.map((inv) =>
            inv.id === editingItem.id
              ? { ...formData, id: editingItem.id }
              : inv
          ),
        },
      };
    } else {
      newData = {
        ...data,
        finances: {
          ...data.finances,
          investments: [...investments, { ...formData, id: Date.now() }],
        },
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowInvestmentModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteInvestment = async (investmentId) => {
    const newData = {
      ...data,
      finances: {
        ...data.finances,
        investments: (data.finances?.investments || []).filter(
          (inv) => inv.id !== investmentId
        ),
      },
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  // === TRANZAKCIÓK ===
  const openTransactionModal = (type = "expense", transaction = null) => {
    setTransactionType(type);
    if (transaction) {
      setEditingItem(transaction);
      setFormData(transaction);
    } else {
      setEditingItem(null);
      setFormData({
        type: type,
        category: type === "income" ? "salary" : "food",
        amount: 0,
        currency: "HUF",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
    setShowTransactionModal(true);
  };

  const saveTransaction = async () => {
    if (!formData.amount || formData.amount <= 0) {
      alert("Add meg az összeget!");
      return;
    }

    let newData;
    const transactions = data.finances?.transactions || [];

    if (editingItem) {
      newData = {
        ...data,
        finances: {
          ...data.finances,
          transactions: transactions.map((t) =>
            t.id === editingItem.id ? { ...formData, id: editingItem.id } : t
          ),
        },
      };
    } else {
      newData = {
        ...data,
        finances: {
          ...data.finances,
          transactions: [
            ...transactions,
            { ...formData, id: Date.now(), addedBy: currentUser.email },
          ],
        },
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowTransactionModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const deleteTransaction = async (transactionId) => {
    const newData = {
      ...data,
      finances: {
        ...data.finances,
        transactions: (data.finances?.transactions || []).filter(
          (t) => t.id !== transactionId
        ),
      },
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const deleteDevice = async (deviceId) => {
    const newData = {
      ...data,
      devices: data.devices.filter((d) => d.id !== deviceId),
    };
    setData(newData);
    await saveUserData(newData);
    setShowDeleteConfirm(null);
  };

  const openShoppingItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        quantity: 1,
        category: "élelmiszer",
        priority: "normal",
        checked: false,
        addedBy: currentUser?.email,
      });
    }
    setShowShoppingItemModal(true);
  };

  const saveShoppingItem = async () => {
    if (!formData.name) {
      alert("A termék neve kötelező!");
      return;
    }

    let newData;
    if (editingItem) {
      newData = {
        ...data,
        shoppingList: data.shoppingList.map((item) =>
          item.id === editingItem.id
            ? { ...formData, id: editingItem.id }
            : item
        ),
      };
    } else {
      newData = {
        ...data,
        shoppingList: [
          ...(data.shoppingList || []),
          {
            ...formData,
            id: Date.now(),
            addedAt: new Date().toISOString(),
          },
        ],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowShoppingItemModal(false);
    setFormData({});
    setEditingItem(null);
  };

  const toggleShoppingItem = async (itemId) => {
    const newData = {
      ...data,
      shoppingList: data.shoppingList.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    };
    setData(newData);
    await saveUserData(newData);
  };

  const deleteShoppingItem = async (itemId) => {
    const newData = {
      ...data,
      shoppingList: data.shoppingList.filter((item) => item.id !== itemId),
    };
    setData(newData);
    await saveUserData(newData);
  };

  const clearCheckedItems = async () => {
    const newData = {
      ...data,
      shoppingList: data.shoppingList.filter((item) => !item.checked),
    };
    setData(newData);
    await saveUserData(newData);
  };

  //Család segédfüggvények
  const addDisease = () => {
    if (!tempDisease.trim()) {
      alert("A betegség neve nem lehet üres!");
      return;
    }
    setFormData({
      ...formData,
      medicalInfo: {
        ...formData.medicalInfo,
        diseases: [...(formData.medicalInfo?.diseases || []), tempDisease],
      },
    });
    setTempDisease("");
  };

  const removeDisease = (index) => {
    setFormData({
      ...formData,
      medicalInfo: {
        ...formData.medicalInfo,
        diseases: formData.medicalInfo.diseases.filter((_, i) => i !== index),
      },
    });
  };

  const addAllergy = () => {
    if (!tempAllergy.trim()) {
      alert("Az allergia neve nem lehet üres!");
      return;
    }
    setFormData({
      ...formData,
      medicalInfo: {
        ...formData.medicalInfo,
        allergies: [...(formData.medicalInfo?.allergies || []), tempAllergy],
      },
    });
    setTempAllergy("");
  };

  const removeAllergy = (index) => {
    setFormData({
      ...formData,
      medicalInfo: {
        ...formData.medicalInfo,
        allergies: formData.medicalInfo.allergies.filter((_, i) => i !== index),
      },
    });
  };

  const addMedication = () => {
    if (!tempMedication.name.trim()) {
      alert("A gyógyszer neve kötelező!");
      return;
    }
    setFormData({
      ...formData,
      medicalInfo: {
        ...formData.medicalInfo,
        medications: [
          ...(formData.medicalInfo?.medications || []),
          { ...tempMedication, id: Date.now() },
        ],
      },
    });
    setTempMedication({ name: "", dosage: "" });
  };

  const removeMedication = (index) => {
    setFormData({
      ...formData,
      medicalInfo: {
        ...formData.medicalInfo,
        medications: formData.medicalInfo.medications.filter(
          (_, i) => i !== index
        ),
      },
    });
  };

  const addBankCard = () => {
    if (!tempBankCard.name.trim() || !tempBankCard.expiry) {
      alert("Kártyatípus és lejárati dátum kötelező!");
      return;
    }
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        bankCards: [
          ...(formData.documents?.bankCards || []),
          { ...tempBankCard, id: Date.now() },
        ],
      },
    });
    setTempBankCard({ name: "", expiry: "" });
  };

  const removeBankCard = (index) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        bankCards: formData.documents.bankCards.filter((_, i) => i !== index),
      },
    });
  };

  //Otthon segédfüggvények
  const addMeter = () => {
    if (!tempMeter.type) {
      alert("Mérőóra típusa kötelező!");
      return;
    }
    setFormData({
      ...formData,
      meters: [
        ...(formData.meters || []),
        { ...tempMeter, id: Date.now(), readings: [] },
      ],
    });
    setTempMeter({
      type: "hideg víz",
      serialNumber: "",
      unit: "m³",
      reminderEnabled: false,
      readings: [],
    });
  };

  const removeMeter = (index) => {
    setFormData({
      ...formData,
      meters: formData.meters.filter((_, i) => i !== index),
    });
  };

  const addMeterReading = (meterIndex) => {
    if (!tempReading.date || !tempReading.value) {
      alert("Dátum és leolvasás kötelező!");
      return;
    }
    const updatedMeters = [...formData.meters];
    updatedMeters[meterIndex].readings.push({
      ...tempReading,
      value: parseFloat(tempReading.value),
      id: Date.now(),
    });
    updatedMeters[meterIndex].readings.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setFormData({ ...formData, meters: updatedMeters });
    setTempReading({ date: "", value: "" });
  };

  const removeMeterReading = (meterIndex, readingIndex) => {
    const updatedMeters = [...formData.meters];
    updatedMeters[meterIndex].readings = updatedMeters[
      meterIndex
    ].readings.filter((_, i) => i !== readingIndex);
    setFormData({ ...formData, meters: updatedMeters });
  };

  // ============= NAPTÁR FUNKCIÓK =============

  const getCalendarEvents = (startDate, endDate) => {
    const events = [];

    // Feladatok
    data.tasks.forEach((task) => {
      const taskDate = new Date(task.dueDate);
      if (taskDate >= startDate && taskDate <= endDate) {
        const assignedMember = data.familyMembers.find(
          (m) => m.id === task.assignedTo
        );
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          date: taskDate,
          type: "feladat",
          color: "bg-blue-500",
          icon: CheckCircle,
          completed: task.completed,
          assignedTo: assignedMember?.name,
        });
      }
    });

    // Születésnapok
    data.familyMembers.forEach((member) => {
      if (member.birthDate) {
        const birthDate = new Date(member.birthDate);
        const thisYearBirth = new Date(
          startDate.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );

        if (thisYearBirth >= startDate && thisYearBirth <= endDate) {
          events.push({
            id: `birthday-${member.id}`,
            title: `${member.name} születésnapja`,
            date: thisYearBirth,
            type: "születésnap",
            color: "bg-pink-500",
            icon: Gift,
          });
        }
      }
    });

    // Orvosi időpontok
    data.healthAppointments.forEach((appt) => {
      const apptDate = new Date(appt.date);
      if (apptDate >= startDate && apptDate <= endDate) {
        const person = data.familyMembers.find((m) => m.id === appt.personId);
        events.push({
          id: `health-${appt.id}`,
          title: `${appt.type} - ${person?.name}`,
          date: apptDate,
          type: "egészség",
          color: "bg-red-500",
          icon: Stethoscope,
        });
      }
    });

    // Járművek - szerviz, műszaki
    data.vehicles.forEach((vehicle) => {
      if (vehicle.nextService) {
        const serviceDate = new Date(vehicle.nextService);
        if (serviceDate >= startDate && serviceDate <= endDate) {
          events.push({
            id: `vehicle-service-${vehicle.id}`,
            title: `${vehicle.name} szervíz`,
            date: serviceDate,
            type: "jármű",
            color: "bg-purple-500",
            icon: Car,
          });
        }
      }
      if (vehicle.mot) {
        const motDate = new Date(vehicle.mot);
        if (motDate >= startDate && motDate <= endDate) {
          events.push({
            id: `vehicle-mot-${vehicle.id}`,
            title: `${vehicle.name} műszaki`,
            date: motDate,
            type: "jármű",
            color: "bg-purple-500",
            icon: Car,
          });
        }
      }
    });

    // Karbantartások
    data.homes.forEach((home) => {
      home.maintenance?.forEach((maint) => {
        const maintDate = new Date(maint.nextDate);
        if (maintDate >= startDate && maintDate <= endDate) {
          events.push({
            id: `maintenance-${home.id}-${maint.task}`,
            title: `${maint.task} - ${home.name}`,
            date: maintDate,
            type: "karbantartás",
            color: "bg-orange-500",
            icon: Wrench,
          });
        }
      });
    });

    return events.sort((a, b) => a.date - b.date);
  };

  const getMonthCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const weeks = [];
    let currentWeek = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      currentWeek.push(new Date(current));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      current.setDate(current.getDate() + 1);
    }

    return weeks;
  };

  const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getWeekNumber = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return `${start.getFullYear()}-W${Math.ceil(
      (start.getTime() - new Date(start.getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    )}`;
  };

  const saveWeeklyNote = async () => {
    if (!formData.note || !formData.note.trim()) {
      alert("A jegyzet nem lehet üres!");
      return;
    }

    const weekId = getWeekNumber(currentDate);

    let newData;
    if (selectedWeekNote) {
      newData = {
        ...data,
        weeklyNotes: data.weeklyNotes.map((n) =>
          n.id === selectedWeekNote.id
            ? { ...formData, id: selectedWeekNote.id }
            : n
        ),
      };
    } else {
      newData = {
        ...data,
        weeklyNotes: [
          ...(data.weeklyNotes || []),
          {
            id: Date.now(),
            weekId: weekId,
            note: formData.note, // ← Ez a fontos
            createdAt: new Date().toISOString(),
            createdBy: currentUser.email,
          },
        ],
      };
    }

    setData(newData);
    await saveUserData(newData);
    setShowWeeklyNoteModal(false);
    setFormData({});
    setSelectedWeekNote(null);
  };

  const deleteWeeklyNote = async (noteId) => {
    const newData = {
      ...data,
      weeklyNotes: data.weeklyNotes.filter((n) => n.id !== noteId),
    };
    setData(newData);
    await saveUserData(newData);
  };

  const openEventModal = (date = null) => {
    setSelectedDate(date || new Date());
    setFormData({
      title: "",
      date: date
        ? date.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      type: "egyéb",
      description: "",
      allDay: true,
      time: "",
    });
    setShowEventModal(true);
  };

  const saveEvent = async () => {
    if (!formData.title || !formData.date) {
      alert("Cím és dátum kötelező!");
      return;
    }

    // Új esemény létrehozása task-ként
    const newTask = {
      id: Date.now(),
      title: formData.title,
      dueDate: formData.date,
      category: formData.type || "egyéb",
      description: formData.description || "",
      completed: false,
      assignedTo: null,
      recurring: { enabled: false },
    };

    const newData = {
      ...data,
      tasks: [...data.tasks, newTask],
    };

    setData(newData);
    await saveUserData(newData);
    setShowEventModal(false);
    setFormData({});
    setSelectedDate(null);
  };

  const updateSettings = async (newSettings) => {
    const newData = { ...data, settings: newSettings };
    setSettings(newSettings);
    setData(newData);
    await saveUserData(newData);
  };

  const moveModule = (moduleId, direction) => {
    const modules = getModules();
    const currentOrder = settings.moduleOrder || modules.map((m) => m.id);
    const currentIndex = currentOrder.indexOf(moduleId);

    if (direction === "up" && currentIndex > 0) {
      const newOrder = [...currentOrder];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [
        newOrder[currentIndex - 1],
        newOrder[currentIndex],
      ];
      updateSettings({ ...settings, moduleOrder: newOrder });
    } else if (direction === "down" && currentIndex < currentOrder.length - 1) {
      const newOrder = [...currentOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
        newOrder[currentIndex + 1],
        newOrder[currentIndex],
      ];
      updateSettings({ ...settings, moduleOrder: newOrder });
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedModuleIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedModuleIndex === null || draggedModuleIndex === dropIndex) return;
    const modules = getModules();
    const currentOrder = settings.moduleOrder || modules.map((m) => m.id);
    const newOrder = [...currentOrder].filter((id) => id !== "beallitasok");
    const [draggedItem] = newOrder.splice(draggedModuleIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    updateSettings({ ...settings, moduleOrder: newOrder });
    setDraggedModuleIndex(null);
  };

  const getAllUpcomingTasks = () => {
    const allTasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let endDate;
    if (timeFilter === "today") {
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeFilter === "week") {
      endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "month") {
      endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      endDate = new Date("2099-12-31");
    }

    data.tasks.forEach((task) => {
      const taskDate = new Date(task.dueDate);
      if (taskDate >= today && taskDate <= endDate) {
        const assignedMember = data.familyMembers.find(
          (m) => m.id === task.assignedTo
        );
        allTasks.push({
          id: `task-${task.id}`,
          title: task.title,
          date: taskDate,
          category: task.category || "egyéb",
          type: "feladat",
          icon: "CheckCircle",
          assignedTo: assignedMember?.name,
          completed: task.completed,
          recurring: task.recurring,
          originalTask: task,
        });
      }
    });

    data.homes.forEach((home) => {
      home.utilities?.forEach((utility, idx) => {
        const dueDate = new Date(utility.dueDate);
        if (dueDate >= today && dueDate <= endDate) {
          allTasks.push({
            id: `utility-${home.id}-${idx}`,
            title: `${utility.name} fizetés - ${home.name}`,
            date: dueDate,
            category: "otthon",
            type: "rezsi",
            icon: "DollarSign",
            details: `${utility.amount.toLocaleString()} Ft`,
            completed: false,
          });
        }
      });

      home.maintenance?.forEach((maint, idx) => {
        const maintDate = new Date(maint.nextDate);
        if (maintDate >= today && maintDate <= endDate) {
          allTasks.push({
            id: `maintenance-${home.id}-${idx}`,
            title: `${maint.task} - ${home.name}`,
            date: maintDate,
            category: "otthon",
            type: "karbantartás",
            icon: "Wrench",
            details: `Ismétlődés: ${maint.frequency}`,
            completed: false,
          });
        }
      });
    });

    data.vehicles.forEach((vehicle) => {
      if (vehicle.nextService) {
        const serviceDate = new Date(vehicle.nextService);
        if (serviceDate >= today && serviceDate <= endDate) {
          allTasks.push({
            id: `vehicle-service-${vehicle.id}`,
            title: `${vehicle.name} - Szervíz`,
            date: serviceDate,
            category: "jármű",
            type: "szervíz",
            icon: "Car",
            details: vehicle.plate,
            completed: false,
          });
        }
      }
      if (vehicle.mot) {
        const motDate = new Date(vehicle.mot);
        if (motDate >= today && motDate <= endDate) {
          allTasks.push({
            id: `vehicle-mot-${vehicle.id}`,
            title: `${vehicle.name} - Műszaki vizsga`,
            date: motDate,
            category: "jármű",
            type: "műszaki",
            icon: "Car",
            details: vehicle.plate,
            completed: false,
          });
        }
      }
      if (vehicle.insurance) {
        const insuranceDate = new Date(vehicle.insurance);
        if (insuranceDate >= today && insuranceDate <= endDate) {
          allTasks.push({
            id: `vehicle-insurance-${vehicle.id}`,
            title: `${vehicle.name} - Biztosítás lejár`,
            date: insuranceDate,
            category: "jármű",
            type: "biztosítás",
            icon: "Car",
            details: vehicle.plate,
            completed: false,
          });
        }
      }
    });

    data.healthAppointments.forEach((appt) => {
      const apptDate = new Date(appt.date);
      if (apptDate >= today && apptDate <= endDate) {
        const person = data.familyMembers.find((m) => m.id === appt.personId);
        allTasks.push({
          id: `health-${appt.id}`,
          title: `${appt.type} - ${person?.name}`,
          date: apptDate,
          category: "egészség",
          type: "orvosi időpont",
          icon: "Stethoscope",
          details: appt.location || "Nincs helyszín megadva",
          completed: false,
        });
      }
    });

    data.familyMembers.forEach((member) => {
      if (member.birthDate) {
        const birthDate = new Date(member.birthDate);
        const thisYearBirth = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );

        if (thisYearBirth < today) {
          thisYearBirth.setFullYear(today.getFullYear() + 1);
        }

        if (thisYearBirth >= today && thisYearBirth <= endDate) {
          const age = thisYearBirth.getFullYear() - birthDate.getFullYear();
          allTasks.push({
            id: `birthday-${member.id}`,
            title: `${member.name} születésnapja`,
            date: thisYearBirth,
            category: "család",
            type: "születésnap",
            icon: "Gift",
            details: `${age}. születésnap`,
            completed: false,
          });
        }
      }
    });

    allTasks.sort((a, b) => a.date - b.date);

    // Keresés szűrő
    let filteredTasks = allTasks;

    if (searchQuery) {
      filteredTasks = filteredTasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Kategória szűrő
    if (filterCategory !== "all") {
      filteredTasks = filteredTasks.filter(
        (task) => task.category === filterCategory
      );
    }

    // Felelős szűrő - ÚJ
    if (filterAssignedTo) {
      if (filterAssignedTo === "unassigned") {
        filteredTasks = filteredTasks.filter(
          (task) => !task.originalTask?.assignedTo && !task.assignedTo
        );
      } else {
        const assignedId = parseInt(filterAssignedTo);
        filteredTasks = filteredTasks.filter(
          (task) =>
            task.originalTask?.assignedTo === assignedId ||
            task.assignedTo === assignedId
        );
      }
    }

    return filteredTasks;
  };

  const generateNotifications = () => {
    if (!settings.notificationSettings?.enabled) return;

    const newNotifications = [];
    const today = new Date();
    const reminderDays = settings.notificationSettings?.daysBeforeReminder || 3;
    const reminderDate = new Date(
      today.getTime() + reminderDays * 24 * 60 * 60 * 1000
    );

    if (settings.notificationSettings?.warrantyReminders && data.devices) {
      data.devices.forEach((device) => {
        if (device.warrantyExpiry) {
          const warrantyDate = new Date(device.warrantyExpiry);
          if (warrantyDate <= reminderDate && warrantyDate >= today) {
            const existing = data.notifications?.find(
              (n) => n.relatedId === `warranty-${device.id}`
            );
            if (!existing) {
              newNotifications.push({
                id: Date.now() + Math.random(),
                type: "warranty",
                title: "Közelgő garancia lejárat",
                message: `${device.name} garanciája lejár`,
                date: device.warrantyExpiry,
                read: false,
                relatedId: `warranty-${device.id}`,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      });
    }

    // Olajcsere emlékeztetők
    if (data.vehicles) {
      data.vehicles.forEach((vehicle) => {
        vehicle.oilChanges?.forEach((oil) => {
          const nextDate = new Date(oil.nextDate);
          const nextKm = oil.nextKm;
          const currentKm = vehicle.km || 0;

          if (
            (nextDate <= reminderDate && nextDate >= today) ||
            currentKm >= nextKm - 500
          ) {
            const existing = data.notifications?.find(
              (n) => n.relatedId === `oil-${vehicle.id}-${oil.id}`
            );
            if (!existing) {
              newNotifications.push({
                id: Date.now() + Math.random(),
                type: "vehicle",
                title: "Olajcsere időpontja közeledik",
                message: `${vehicle.name} - ${
                  currentKm >= nextKm - 500
                    ? `${nextKm} km`
                    : nextDate.toLocaleDateString("hu-HU")
                }`,
                date: oil.nextDate,
                read: false,
                relatedId: `oil-${vehicle.id}-${oil.id}`,
                createdAt: new Date().toISOString(),
              });
            }
          }
        });

        // Km rögzítés emlékeztető
        if (vehicle.kmReminder?.enabled) {
          const lastRecorded = vehicle.kmReminder.lastRecorded
            ? new Date(vehicle.kmReminder.lastRecorded)
            : new Date(0);
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

          if (lastRecorded < monthAgo) {
            const existing = data.notifications?.find(
              (n) => n.relatedId === `km-reminder-${vehicle.id}`
            );
            if (!existing) {
              newNotifications.push({
                id: Date.now() + Math.random(),
                type: "vehicle",
                title: "Km állás rögzítése",
                message: `${vehicle.name} - Rögzítsd a km állást`,
                date: new Date().toISOString(),
                read: false,
                relatedId: `km-reminder-${vehicle.id}`,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }

        // Matrica lejárat
        vehicle.vignettes?.forEach((vignette) => {
          const validUntil = new Date(vignette.validUntil);
          if (validUntil <= reminderDate && validUntil >= today) {
            const existing = data.notifications?.find(
              (n) => n.relatedId === `vignette-${vehicle.id}-${vignette.id}`
            );
            if (!existing) {
              newNotifications.push({
                id: Date.now() + Math.random(),
                type: "vehicle",
                title: "Matrica lejárat",
                message: `${vehicle.name} - ${vignette.type} matrica (${vignette.country})`,
                date: vignette.validUntil,
                read: false,
                relatedId: `vignette-${vehicle.id}-${vignette.id}`,
                createdAt: new Date().toISOString(),
              });
            }
          }
        });
      });
    }

    // Dokumentumok lejárata (személyi, jogsi, bankkártya)
    data.familyMembers.forEach((member) => {
      // Személyi igazolvány
      if (member.documents?.idCard) {
        const idExpiry = new Date(member.documents.idCard);
        if (idExpiry <= reminderDate && idExpiry >= today) {
          const existing = data.notifications?.find(
            (n) => n.relatedId === `id-card-${member.id}`
          );
          if (!existing) {
            newNotifications.push({
              id: Date.now() + Math.random(),
              type: "document",
              title: "Személyi igazolvány lejárat",
              message: `${
                member.name
              } személyi igazolványa lejár: ${idExpiry.toLocaleDateString(
                "hu-HU"
              )}`,
              date: member.documents.idCard,
              read: false,
              relatedId: `id-card-${member.id}`,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      // Jogosítvány
      if (member.documents?.drivingLicense) {
        const licenseExpiry = new Date(member.documents.drivingLicense);
        if (licenseExpiry <= reminderDate && licenseExpiry >= today) {
          const existing = data.notifications?.find(
            (n) => n.relatedId === `license-${member.id}`
          );
          if (!existing) {
            newNotifications.push({
              id: Date.now() + Math.random(),
              type: "document",
              title: "Jogosítvány lejárat",
              message: `${
                member.name
              } jogosítványa lejár: ${licenseExpiry.toLocaleDateString(
                "hu-HU"
              )}`,
              date: member.documents.drivingLicense,
              read: false,
              relatedId: `license-${member.id}`,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      // Bankkártyák
      member.documents?.bankCards?.forEach((card) => {
        const cardExpiry = new Date(card.expiry);
        if (cardExpiry <= reminderDate && cardExpiry >= today) {
          const existing = data.notifications?.find(
            (n) => n.relatedId === `card-${member.id}-${card.id}`
          );
          if (!existing) {
            newNotifications.push({
              id: Date.now() + Math.random(),
              type: "document",
              title: "Bankkártya lejárat",
              message: `${member.name} - ${
                card.name
              } kártya lejár: ${cardExpiry.toLocaleDateString("hu-HU")}`,
              date: card.expiry,
              read: false,
              relatedId: `card-${member.id}-${card.id}`,
              createdAt: new Date().toISOString(),
            });
          }
        }
      });
    });

    // Mérőóra leolvasási emlékeztetők
    data.homes.forEach((home) => {
      home.meters?.forEach((meter) => {
        if (meter.reminderEnabled) {
          const lastReading = meter.readings?.[0];
          const lastDate = lastReading
            ? new Date(lastReading.date)
            : new Date(0);
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

          if (lastDate < monthAgo) {
            const existing = data.notifications?.find(
              (n) => n.relatedId === `meter-${home.id}-${meter.id}`
            );
            if (!existing) {
              newNotifications.push({
                id: Date.now() + Math.random(),
                type: "maintenance",
                title: "Mérőóra leolvasás",
                message: `${home.name} - ${meter.type} leolvasása`,
                date: new Date().toISOString(),
                read: false,
                relatedId: `meter-${home.id}-${meter.id}`,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      });
    });

    // Előfizetés próbaidőszak emlékeztetők
    if (data.subscriptions) {
      data.subscriptions.forEach((sub) => {
        if (sub.trialEnd && sub.active) {
          const trialDate = new Date(sub.trialEnd);
          if (trialDate <= reminderDate && trialDate >= today) {
            const existing = data.notifications?.find(
              (n) => n.relatedId === `trial-${sub.id}`
            );
            if (!existing) {
              newNotifications.push({
                id: Date.now() + Math.random(),
                type: "subscription",
                title: "Próbaidőszak lejár",
                message: `${sub.name} - ${sub.monthlyPrice} Ft/hó`,
                date: sub.trialEnd,
                read: false,
                relatedId: `trial-${sub.id}`,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      });
    }

    // Előfizetés szerződés lejárat
    if (data.subscriptions) {
      data.subscriptions.forEach((sub) => {
        if (sub.contractEnd && sub.active && !sub.autoRenew) {
          const contractDate = new Date(sub.contractEnd);
          if (contractDate <= reminderDate && contractDate >= today) {
            const existing = data.notifications?.find(
              (n) => n.relatedId === `contract-${sub.id}`
            );
            if (!existing) {
              newNotifications.push({
                id: Date.now() + Math.random(),
                type: "subscription",
                title: "Szerződés lejár",
                message: `${sub.name} - megújítás szükséges!`,
                date: sub.contractEnd,
                read: false,
                relatedId: `contract-${sub.id}`,
                createdAt: new Date().toISOString(),
              });

              // Feladat generálás
              const taskExists = data.tasks?.find(
                (t) => t.relatedId === `contract-${sub.id}`
              );
              if (!taskExists) {
                const newTask = {
                  id: Date.now() + Math.random(),
                  title: `${sub.name} előfizetés megújítása`,
                  dueDate: sub.contractEnd,
                  category: "pénzügyek",
                  completed: false,
                  relatedId: `contract-${sub.id}`,
                };
                // Hozzáadás az adatokhoz
                data.tasks = [...(data.tasks || []), newTask];
              }
            }
          }
        }
      });
    }

    // Gumiabroncs csere figyelmeztetés
    if (data.vehicles) {
      data.vehicles.forEach((vehicle) => {
        vehicle.tires?.forEach((tire) => {
          const warnings = checkTireCondition(tire);
          if (warnings.length > 0) {
            const existing = data.notifications?.find(
              (n) => n.relatedId === `tire-${vehicle.id}-${tire.id}`
            );
            if (!existing) {
              newNotifications.push({
                id: Date.now() + Math.random(),
                type: "vehicle",
                title: "Gumiabroncs csere ajánlott",
                message: `${vehicle.name} - ${tire.position}: ${warnings
                  .map((w) => w.message)
                  .join(", ")}`,
                date: new Date().toISOString(),
                read: false,
                relatedId: `tire-${vehicle.id}-${tire.id}`,
                createdAt: new Date().toISOString(),
              });
            }
          }
        });
      });
    }

    // Hitel törlesztés emlékeztetők
    if (data.finances?.loans) {
      data.finances.loans.forEach((loan) => {
        if (loan.reminderEnabled !== false && loan.paymentDay) {
          const today = new Date();
          const paymentDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            parseInt(loan.paymentDay)
          );

          if (paymentDate < today) {
            paymentDate.setMonth(paymentDate.getMonth() + 1);
          }

          if (paymentDate <= reminderDate && paymentDate >= today) {
            const existing = data.notifications?.find(
              (n) =>
                n.relatedId ===
                `loan-payment-${loan.id}-${paymentDate.getMonth()}`
            );
            if (!existing) {
              newNotifications.push({
                id: Date.now() + Math.random(),
                type: "finance",
                title: "Hitel törlesztés",
                message: `${loan.name} - ${parseFloat(
                  loan.monthlyPayment
                ).toLocaleString()} Ft`,
                date: paymentDate.toISOString().split("T")[0],
                read: false,
                relatedId: `loan-payment-${loan.id}-${paymentDate.getMonth()}`,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      });
    }

    if (newNotifications.length > 0) {
      const updatedData = {
        ...data,
        notifications: [...(data.notifications || []), ...newNotifications],
      };
      setData(updatedData);
      saveUserData(updatedData);
    }
  };

  const markAsRead = async (notificationId) => {
    const updatedData = {
      ...data,
      notifications: data.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    };
    setData(updatedData);
    await saveUserData(updatedData);
  };

  const markAllAsRead = async () => {
    const updatedData = {
      ...data,
      notifications: data.notifications.map((n) => ({ ...n, read: true })),
    };
    setData(updatedData);
    await saveUserData(updatedData);
  };

  const deleteNotification = async (notificationId) => {
    const updatedData = {
      ...data,
      notifications: data.notifications.filter((n) => n.id !== notificationId),
    };
    setData(updatedData);
    await saveUserData(updatedData);
  };

  useEffect(() => {
    if (data.notifications) {
      const count = data.notifications.filter((n) => !n.read).length;
      setUnreadCount(count);
    }
  }, [data.notifications]);

  // Olvasatlan üzenetek számolása
  useEffect(() => {
    if (data.chatMessages && currentUser) {
      const unread = data.chatMessages.filter(
        (m) => !m.read && m.sender !== currentUser.email
      ).length;
      setUnreadMessagesCount(unread);

      // Ha van új olvasatlan üzenet és nem a chat modulban vagyunk, értesítés
      if (unread > 0 && activeModule !== "chat") {
        data.chatMessages.forEach((msg) => {
          if (!msg.read && msg.sender !== currentUser.email) {
            const existing = data.notifications?.find(
              (n) => n.relatedId === `chat-${msg.id}`
            );
            if (!existing) {
              const newNotification = {
                id: Date.now() + Math.random(),
                type: "chat",
                title: "Új üzenet",
                message: `${msg.sender}: ${msg.text.substring(0, 50)}${
                  msg.text.length > 50 ? "..." : ""
                }`,
                date: msg.timestamp,
                read: false,
                relatedId: `chat-${msg.id}`,
                createdAt: new Date().toISOString(),
              };

              const updatedData = {
                ...data,
                notifications: [...(data.notifications || []), newNotification],
              };
              saveUserData(updatedData);
            }
          }
        });
      }
    }
  }, [data.chatMessages, currentUser, activeModule]);

  // Amikor belépünk a chat modulba, jelöljük olvasottnak az üzeneteket
  useEffect(() => {
    if (activeModule === "chat" && unreadMessagesCount > 0) {
      markMessagesAsRead();
    }
  }, [activeModule]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      generateNotifications();
      const interval = setInterval(generateNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUser, data.devices]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        !event.target.closest(".notification-dropdown") &&
        !event.target.closest(".notification-button")
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const renderDashboard = () => {
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter((t) => t.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const monthlyUtilities = {};
    data.homes.forEach((home) => {
      home.utilities?.forEach((utility) => {
        const month = new Date(utility.dueDate).toLocaleDateString("hu-HU", {
          month: "long",
        });
        if (!monthlyUtilities[month]) {
          monthlyUtilities[month] = 0;
        }
        monthlyUtilities[month] += utility.amount;
      });
    });

    const utilitiesData = Object.entries(monthlyUtilities).map(
      ([month, amount]) => ({
        month,
        amount,
      })
    );

    const tasksByCategory = {
      otthon: 0,
      jármű: 0,
      egészség: 0,
      egyéb: 0,
    };
    data.tasks.forEach((task) => {
      const category = task.category || "egyéb";
      if (tasksByCategory[category] !== undefined) {
        tasksByCategory[category]++;
      }
    });

    const categoryData = Object.entries(tasksByCategory)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: count,
      }));

    const upcomingDeadlines = getAllUpcomingTasks()
      .filter((t) => !t.completed)
      .slice(0, 7);

    const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
    const totalMonthlyCost = Object.values(monthlyUtilities).reduce(
      (sum, amount) => sum + amount,
      0
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 size={32} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-600">Áttekintés és statisztikák</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Activity size={24} />
              <span className="text-2xl font-bold">{activeTasks}</span>
            </div>
            <div className="text-sm opacity-90">Aktív feladatok</div>
            <div className="text-xs opacity-75 mt-1">Összes: {totalTasks}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target size={24} />
              <span className="text-2xl font-bold">{completionRate}%</span>
            </div>
            <div className="text-sm opacity-90">Teljesítési arány</div>
            <div className="text-xs opacity-75 mt-1">
              {completedTasks} kész / {totalTasks}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Users size={24} />
              <span className="text-2xl font-bold">
                {data.familyMembers.length}
              </span>
            </div>
            <div className="text-sm opacity-90">Családtagok</div>
            <div className="text-xs opacity-75 mt-1">
              {data.children.length} gyerek
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={24} />
              <span className="text-2xl font-bold">
                {Math.round(totalMonthlyCost / 1000)}k
              </span>
            </div>
            <div className="text-sm opacity-90">Havi rezsik</div>
            <div className="text-xs opacity-75 mt-1">
              {totalMonthlyCost.toLocaleString()} Ft
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {totalTasks > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Feladat teljesítés
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Befejezett", value: completedTasks },
                      { name: "Aktív", value: activeTasks },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {categoryData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Feladatok kategóriánként
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {utilitiesData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h3 className="font-semibold text-gray-800 mb-4">
                Havi rezsik összesítése
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={utilitiesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()} Ft`}
                  />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {upcomingDeadlines.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">Közelgő határidők</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingDeadlines.map((task) => {
                const today = new Date();
                const daysUntil = Math.ceil(
                  (task.date - today) / (1000 * 60 * 60 * 24)
                );
                const isUrgent = daysUntil <= 3;

                return (
                  <div
                    key={task.id}
                    className={`p-4 flex items-center gap-4 ${
                      isUrgent ? "bg-orange-50" : ""
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {daysUntil}n
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-800">
                          {task.title}
                        </h4>
                        {task.recurring?.enabled && (
                          <Repeat
                            size={16}
                            className="text-blue-600"
                            title="Ismétlődő feladat"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span>{task.date.toLocaleDateString("hu-HU")}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {task.type}
                        </span>
                      </div>
                    </div>
                    {isUrgent && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Sürgős
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data.familyMembers.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Users size={48} className="mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold text-gray-800 mb-2">
              Kezdj az adatok felvételével!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add hozzá az első családtagokat, hogy láthasd a statisztikákat és
              grafikonokat.
            </p>
            <button
              onClick={() => setActiveModule("csalad")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Család modul megnyitása
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderAttekintes = () => {
    const allUpcomingTasks = getAllUpcomingTasks();
    const activeTasks = allUpcomingTasks.filter((t) => !t.completed);
    const completedTasks = allUpcomingTasks.filter((t) => t.completed);

    const getIconComponent = (iconName) => {
      const icons = {
        CheckCircle: CheckCircle,
        DollarSign: DollarSign,
        Wrench: Wrench,
        Car: Car,
        Stethoscope: Stethoscope,
        Gift: Gift,
      };
      return icons[iconName] || CheckCircle;
    };

    const getCategoryColor = (category) => {
      const colors = {
        otthon: "bg-blue-100 text-blue-700",
        jármű: "bg-purple-100 text-purple-700",
        egészség: "bg-red-100 text-red-700",
        család: "bg-pink-100 text-pink-700",
        egyéb: "bg-gray-100 text-gray-700",
      };
      return colors[category] || colors.egyéb;
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Áttekintés</h2>
          <button
            onClick={() => {
              setFormData({
                title: "",
                dueDate: "",
                assignedTo: "",
                category: "otthon",
                recurring: { enabled: false },
              });
              setShowTaskModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform"
          >
            <Plus size={20} />
            <span className="font-medium">Új feladat</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-800">Időszak</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["today", "week", "month", "all"].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter === "today" && "Ma"}
                {filter === "week" && "Következő 7 nap"}
                {filter === "month" && "Következő 30 nap"}
                {filter === "all" && "Összes"}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Keresés a feladatok között..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Összes kategória</option>
                <option value="otthon">Otthon</option>
                <option value="jármű">Jármű</option>
                <option value="egészség">Egészség</option>
                <option value="család">Család</option>
                <option value="egyéb">Egyéb</option>
              </select>
              <select
                value={filterAssignedTo || "all"}
                onChange={(e) =>
                  setFilterAssignedTo(
                    e.target.value === "all" ? null : e.target.value
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Összes felelős</option>
                <option value="unassigned">Nincs felelős</option>
                {data.familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Összes feladat</div>
            <div className="text-2xl font-bold text-gray-800">
              {activeTasks.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Ma esedékes</div>
            <div className="text-2xl font-bold text-orange-600">
              {
                allUpcomingTasks.filter((t) => {
                  const today = new Date();
                  const taskDate = new Date(t.date);
                  return (
                    taskDate.toDateString() === today.toDateString() &&
                    !t.completed
                  );
                }).length
              }
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">7 napon belül</div>
            <div className="text-2xl font-bold text-blue-600">
              {
                allUpcomingTasks.filter((t) => {
                  const today = new Date();
                  const weekLater = new Date(
                    today.getTime() + 7 * 24 * 60 * 60 * 1000
                  );
                  return t.date <= weekLater && !t.completed;
                }).length
              }
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Befejezett</div>
            <div className="text-2xl font-bold text-green-600">
              {completedTasks.length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Feladatok</h3>
            <span className="text-sm text-gray-600">
              {activeTasks.length} aktív
            </span>
          </div>
          <div className="divide-y divide-gray-200">
            {activeTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle
                  size={48}
                  className="mx-auto mb-3 text-green-500"
                />
                <p>Nincs aktív feladat ebben az időszakban!</p>
              </div>
            ) : (
              activeTasks.map((task) => {
                const Icon = getIconComponent(task.icon);
                const today = new Date();
                const isToday =
                  task.date.toDateString() === today.toDateString();
                const isPast = task.date < today;

                return (
                  <div
                    key={task.id}
                    className={`p-4 hover:bg-gray-50 flex items-center gap-4 ${
                      isPast ? "bg-red-50" : ""
                    }`}
                  >
                    {/* Kipipálás gomb MINDEN feladat típushoz */}
                    <button
                      onClick={() => {
                        if (task.type === "feladat") {
                          toggleTask(task.originalTask.id);
                        } else if (task.type === "rezsi") {
                          // task.id formátuma: utility-{homeId}-{index}
                          const [_, homeId, idx] = task.id.split("-");
                          toggleUtilityPayment(parseInt(homeId), parseInt(idx));
                        } else if (task.type === "karbantartás") {
                          // task.id formátuma: maintenance-{homeId}-{index}
                          const [_, homeId, idx] = task.id.split("-");
                          toggleMaintenance(parseInt(homeId), parseInt(idx));
                        } else if (task.type === "szervíz") {
                          // task.id formátuma: vehicle-service-{vehicleId}
                          const vehicleId = parseInt(task.id.split("-")[2]);
                          toggleVehicleService(vehicleId, "service");
                        } else if (task.type === "műszaki") {
                          // task.id formátuma: vehicle-mot-{vehicleId}
                          const vehicleId = parseInt(task.id.split("-")[2]);
                          toggleVehicleService(vehicleId, "mot");
                        } else if (task.type === "biztosítás") {
                          // task.id formátuma: vehicle-insurance-{vehicleId}
                          const vehicleId = parseInt(task.id.split("-")[2]);
                          toggleVehicleService(vehicleId, "insurance");
                        } else if (task.type === "orvosi időpont") {
                          // task.id formátuma: health-{appointmentId}
                          const appointmentId = parseInt(task.id.split("-")[1]);
                          if (
                            window.confirm(
                              "Befejezett az orvosi időpont? Ez törölni fogja."
                            )
                          ) {
                            toggleHealthAppointment(appointmentId);
                          }
                        } else if (task.type === "születésnap") {
                          // task.id formátuma: birthday-{memberId}
                          const memberId = parseInt(task.id.split("-")[1]);
                          markBirthdayAsViewed(memberId);
                        }
                      }}
                      className="text-gray-400 hover:text-green-600 transition"
                      title="Elvégezve"
                    >
                      <Circle size={24} />
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-800">
                          {task.title}
                        </h4>
                        {task.recurring?.enabled && (
                          <Repeat
                            size={16}
                            className="text-blue-600"
                            title="Ismétlődő feladat"
                          />
                        )}
                        {isToday && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-medium">
                            MA
                          </span>
                        )}
                        {isPast && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
                            LEJÁRT
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {task.date.toLocaleDateString("hu-HU")}
                        </span>
                        {task.assignedTo && (
                          <span className="text-blue-600">
                            → {task.assignedTo}
                          </span>
                        )}
                        {task.details && (
                          <span className="text-gray-500">{task.details}</span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                            task.category
                          )}`}
                        >
                          {task.type}
                        </span>
                      </div>
                    </div>

                    {/* Törlés gomb csak manuális feladatoknál */}
                    {task.type === "feladat" && (
                      <button
                        onClick={() => deleteTask(task.originalTask.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {completedTasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                Befejezett feladatok
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 hover:bg-gray-50 flex items-center gap-4 opacity-60"
                >
                  <button
                    onClick={() => toggleTask(task.originalTask.id)}
                    className="text-green-600"
                  >
                    <CheckCircle size={24} />
                  </button>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 line-through">
                      {task.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => deleteTask(task.originalTask.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOtthon = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Otthon</h2>
        <button
          onClick={() => openHomeModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Új ingatlan</span>
          <span className="sm:hidden">Új</span>
        </button>
      </div>

      {data.homes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          <Home size={48} className="mx-auto mb-3 text-gray-400" />
          <p>Még nincs hozzáadott ingatlan</p>
        </div>
      ) : (
        data.homes.map((home) => {
          const currentUtilities = home.utilities?.slice(0, 3) || [];
          const olderUtilities = home.utilities?.slice(3) || [];
          const isExpanded = showAllUtilities[home.id];

          return (
            <div
              key={home.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{home.name}</h3>
                  <p className="text-sm text-gray-600">{home.address}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openHomeModal(home)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setShowDeleteConfirm({
                        type: "home",
                        id: home.id,
                        name: home.name,
                      })
                    }
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Mérőórák */}
              {home.meters && home.meters.length > 0 && (
                <div className="p-4 bg-purple-50 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Activity size={18} />
                    Mérőórák
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {home.meters.map((meter, meterIdx) => {
                      const lastReading = meter.readings?.[0];
                      const prevReading = meter.readings?.[1];
                      const consumption =
                        lastReading && prevReading
                          ? lastReading.value - prevReading.value
                          : null;

                      return (
                        <div
                          key={meter.id}
                          className="bg-white p-3 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-800">
                              {meter.type}
                            </span>
                            {meter.reminderEnabled && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                📅 Havi
                              </span>
                            )}
                          </div>
                          {meter.serialNumber && (
                            <p className="text-xs text-gray-500 mb-2">
                              Gyári szám: {meter.serialNumber}
                            </p>
                          )}
                          {lastReading ? (
                            <>
                              <div className="text-lg font-bold text-blue-600">
                                {lastReading.value} {meter.unit}
                              </div>
                              <div className="text-xs text-gray-600">
                                {new Date(lastReading.date).toLocaleDateString(
                                  "hu-HU"
                                )}
                              </div>
                              {consumption !== null && (
                                <div className="text-xs text-gray-600 mt-1">
                                  Fogyasztás: {consumption.toFixed(2)}{" "}
                                  {meter.unit}
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">
                              Nincs leolvasás
                            </p>
                          )}
                          <button
                            onClick={() => openQuickMeterModal(home, meterIdx)}
                            className="mt-2 w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                          >
                            <Plus size={16} />
                            Új leolvasás
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rezsik */}
              {home.utilities && home.utilities.length > 0 && (
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <DollarSign size={18} />
                    Rezsik
                  </h4>
                  <div className="grid gap-3">
                    {currentUtilities.map((utility, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-700">
                          {utility.name}
                        </span>
                        <div className="text-right">
                          <div className="font-semibold text-gray-800">
                            {utility.amount.toLocaleString()} Ft
                          </div>
                          <div className="text-sm text-gray-600">
                            Határidő:{" "}
                            {new Date(utility.dueDate).toLocaleDateString(
                              "hu-HU"
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isExpanded &&
                      olderUtilities.map((utility, idx) => (
                        <div
                          key={idx + 3}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg opacity-70"
                        >
                          <span className="font-medium text-gray-700">
                            {utility.name}
                          </span>
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">
                              {utility.amount.toLocaleString()} Ft
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(utility.dueDate).toLocaleDateString(
                                "hu-HU"
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {olderUtilities.length > 0 && (
                    <button
                      onClick={() =>
                        setShowAllUtilities({
                          ...showAllUtilities,
                          [home.id]: !isExpanded,
                        })
                      }
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {isExpanded
                        ? "Régebbiek elrejtése"
                        : `${olderUtilities.length} régebbi megjelenítése`}
                    </button>
                  )}
                </div>
              )}

              {/* Karbantartások */}
              {home.maintenance && home.maintenance.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Wrench size={18} />
                      Karbantartások
                    </h4>
                    <button
                      onClick={() => openQuickMaintenanceModal(home)}
                      className="px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Új
                    </button>
                  </div>
                  <div className="grid gap-3">
                    {home.maintenance.map((maint, idx) => {
                      const getFrequencyText = () => {
                        if (maint.frequency === "x évente") {
                          return `${maint.customYears} évente`;
                        }
                        return maint.frequency;
                      };

                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"
                        >
                          <span className="font-medium text-gray-700">
                            {maint.task}
                          </span>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-800">
                              {new Date(maint.nextDate).toLocaleDateString(
                                "hu-HU"
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              {getFrequencyText()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const renderJarmuvek = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Járművek</h2>
        <button
          onClick={() => openVehicleModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Új jármű</span>
          <span className="sm:hidden">Új</span>
        </button>
      </div>

      {data.vehicles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          <Car size={48} className="mx-auto mb-3 text-gray-400" />
          <p>Még nincs hozzáadott jármű</p>
        </div>
      ) : (
        data.vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Car size={32} className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {vehicle.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Rendszám: {vehicle.plate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openKmModal(vehicle)}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                    title="Km rögzítés"
                  >
                    <Activity size={16} />
                    Km
                  </button>
                  <button
                    onClick={() => openQuickServiceModal(vehicle)}
                    className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
                    title="Gyors szervíz"
                  >
                    <Wrench size={16} />
                    Szervíz
                  </button>
                  <button
                    onClick={() => openVehicleModal(vehicle)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setShowDeleteConfirm({
                        type: "vehicle",
                        id: vehicle.id,
                        name: vehicle.name,
                      })
                    }
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Km állás</p>
                <p className="font-semibold text-gray-800 text-lg">
                  {vehicle.km ? vehicle.km.toLocaleString() : "0"} km
                </p>
                {vehicle.kmReminder?.enabled && (
                  <p className="text-xs text-blue-600 mt-1">
                    📅 Havi emlékeztető aktív
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Következő szervíz</p>
                <p className="font-semibold text-gray-800">
                  {vehicle.nextService
                    ? new Date(vehicle.nextService).toLocaleDateString("hu-HU")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Műszaki</p>
                <p className="font-semibold text-gray-800">
                  {vehicle.mot
                    ? new Date(vehicle.mot).toLocaleDateString("hu-HU")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Biztosítás</p>
                <p className="font-semibold text-gray-800">
                  {vehicle.insurance
                    ? new Date(vehicle.insurance).toLocaleDateString("hu-HU")
                    : "-"}
                </p>
              </div>
            </div>

            {/* Gumiabroncsok */}
            {vehicle.tires && vehicle.tires.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-blue-50">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <span>🚗</span> Gumiabroncsok ({vehicle.tires.length})
                </h4>
                <div className="grid gap-2">
                  {vehicle.tires.map((tire, idx) => {
                    const warnings = checkTireCondition(tire);
                    const hasWarning = warnings.length > 0;
                    const hasCritical = warnings.some(
                      (w) => w.type === "age" || w.type === "depth"
                    );

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg shadow-sm ${
                          hasCritical
                            ? "bg-red-50 border-2 border-red-500"
                            : hasWarning
                            ? "bg-orange-50 border-2 border-orange-400"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {hasCritical && (
                                <span className="text-red-600 font-bold">
                                  ⚠️
                                </span>
                              )}
                              <span className="font-semibold text-gray-800">
                                {tire.position}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {tire.type}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {tire.brand && (
                                <span className="font-medium">
                                  {tire.brand}{" "}
                                </span>
                              )}
                              {tire.size}
                              {tire.manufactureYear && (
                                <span> • {tire.manufactureYear}</span>
                              )}
                              {tire.treadDepth && (
                                <span
                                  className={`ml-2 font-semibold ${
                                    parseFloat(tire.treadDepth) <= 1.6
                                      ? "text-red-600"
                                      : parseFloat(tire.treadDepth) <= 3
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  • Profil: {tire.treadDepth} mm
                                </span>
                              )}
                            </div>
                            {hasWarning && (
                              <div className="mt-2 space-y-1">
                                {warnings.map((warning, wIdx) => (
                                  <div
                                    key={wIdx}
                                    className={`text-xs font-semibold ${
                                      warning.type === "age" ||
                                      warning.type === "depth"
                                        ? "text-red-700"
                                        : "text-orange-700"
                                    }`}
                                  >
                                    • {warning.message}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Olajcserék */}
            {vehicle.oilChanges && vehicle.oilChanges.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-orange-50">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <DollarSign size={16} /> Olajcserék
                </h4>
                <div className="space-y-2">
                  {vehicle.oilChanges
                    .slice()
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 3)
                    .map((oil, idx) => {
                      const currentKm = vehicle.km || 0;
                      const kmUntilNext = oil.nextKm - currentKm;
                      const isNearKm = kmUntilNext < 1000;

                      return (
                        <div
                          key={idx}
                          className={`bg-white p-3 rounded-lg shadow-sm ${
                            isNearKm ? "border-2 border-orange-500" : ""
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              {new Date(oil.date).toLocaleDateString("hu-HU")}
                            </span>
                            <span className="font-semibold text-gray-800">
                              {oil.km?.toLocaleString()} km
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Következő: {oil.nextKm?.toLocaleString()} km (
                            {kmUntilNext > 0
                              ? `még ${kmUntilNext.toLocaleString()} km`
                              : "lejárt!"}
                            ) vagy{" "}
                            {new Date(oil.nextDate).toLocaleDateString("hu-HU")}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Matricák */}
            {vehicle.vignettes && vehicle.vignettes.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-green-50">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <span>🎫</span> Matricák
                </h4>
                <div className="grid gap-2">
                  {vehicle.vignettes.map((vig, idx) => {
                    const validUntil = new Date(vig.validUntil);
                    const today = new Date();
                    const isExpiringSoon =
                      validUntil <=
                      new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                    const isExpired = validUntil < today;

                    return (
                      <div
                        key={idx}
                        className={`bg-white p-3 rounded-lg shadow-sm ${
                          isExpired
                            ? "border-2 border-red-500"
                            : isExpiringSoon
                            ? "border-2 border-orange-500"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-800">
                            {vig.type} - {vig.country}
                          </span>
                          {vig.price && (
                            <span className="text-sm text-gray-600">
                              {vig.price} Ft
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(vig.validFrom).toLocaleDateString("hu-HU")}{" "}
                          - {validUntil.toLocaleDateString("hu-HU")}
                        </div>
                        {(isExpired || isExpiringSoon) && (
                          <div
                            className={`text-xs font-semibold mt-1 ${
                              isExpired ? "text-red-600" : "text-orange-600"
                            }`}
                          >
                            {isExpired ? "⚠️ LEJÁRT!" : "⚠️ Hamarosan lejár!"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Szervíz történet */}
            {vehicle.serviceHistory && vehicle.serviceHistory.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Wrench size={18} />
                  Szervíz történet
                </h4>
                <div className="space-y-2">
                  {vehicle.serviceHistory
                    .slice()
                    .reverse()
                    .slice(0, 3)
                    .map((service, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                      >
                        <div>
                          <span className="font-medium text-gray-800">
                            {service.description}
                          </span>
                          <span className="text-gray-600 ml-2">
                            {new Date(service.date).toLocaleDateString("hu-HU")}
                          </span>
                        </div>
                        {service.cost > 0 && (
                          <span className="font-semibold text-blue-600">
                            {service.cost?.toLocaleString()} Ft
                          </span>
                        )}
                      </div>
                    ))}
                  {vehicle.serviceHistory.length > 3 && (
                    <button
                      onClick={() => openVehicleModal(vehicle)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      További {vehicle.serviceHistory.length - 3} szervíz
                      megtekintése
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderEgeszseg = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Egészség</h2>
        <button
          onClick={() => openHealthModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={data.familyMembers.length === 0}
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Új időpont</span>
          <span className="sm:hidden">Új</span>
        </button>
      </div>

      {data.familyMembers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            Először add hozzá a családtagokat a Család modulban!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Orvosi időpontok</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {data.healthAppointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Stethoscope size={48} className="mx-auto mb-3 text-gray-400" />
                <p>Még nincs időpont felvéve</p>
              </div>
            ) : (
              data.healthAppointments.map((appt) => {
                const person = data.familyMembers.find(
                  (m) => m.id === appt.personId
                );
                return (
                  <div key={appt.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <Stethoscope size={20} className="text-red-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">
                          {appt.type}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {person?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(appt.date).toLocaleDateString("hu-HU")} -{" "}
                          {appt.location || "Nincs megadva"}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          {appt.phone || "Nincs telefonszám"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openHealthModal(appt)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setShowDeleteConfirm({
                              type: "health",
                              id: appt.id,
                              name: appt.type,
                            })
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderGyerekek = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gyerekek</h2>
        <button
          onClick={() => openChildModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={data.familyMembers.length === 0}
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Gyerek hozzáadása</span>
          <span className="sm:hidden">Új</span>
        </button>
      </div>

      {data.familyMembers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            Először add hozzá a családtagokat a Család modulban!
          </p>
        </div>
      ) : data.children.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          <Baby size={48} className="mx-auto mb-3 text-gray-400" />
          <p>Még nincs hozzáadott gyerek</p>
        </div>
      ) : (
        data.children.map((child) => {
          const member = data.familyMembers.find(
            (m) => m.id === child.memberId
          );
          return (
            <div
              key={child.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {member?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Születési dátum:{" "}
                    {member?.birthDate
                      ? new Date(member.birthDate).toLocaleDateString("hu-HU")
                      : "-"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openChildModal(child)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setShowDeleteConfirm({
                        type: "child",
                        id: child.id,
                        name: member?.name,
                      })
                    }
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Pill size={18} />
                  Oltások
                </h4>
                {child.vaccinations && child.vaccinations.length > 0 ? (
                  <div className="grid gap-2">
                    {child.vaccinations.map((vacc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 bg-green-50 rounded"
                      >
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-sm text-gray-700">
                          {vacc.name}
                        </span>
                        <span className="text-xs text-gray-600 ml-auto">
                          {new Date(vacc.date).toLocaleDateString("hu-HU")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nincs rögzített oltás</p>
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Elfoglaltságok
                </h4>
                {child.activities && child.activities.length > 0 ? (
                  <div className="grid gap-2">
                    {child.activities.map((activity, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-gray-800">
                          {activity.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.schedule}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Nincs rögzített elfoglaltság
                  </p>
                )}
              </div>

              {/* Mérföldkövek */}
              <div className="p-4 border-t border-gray-200 bg-yellow-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <TrendingUp size={16} className="text-yellow-600" />
                    Fejlődési mérföldkövek
                  </h4>
                  <button
                    onClick={() => openMilestoneModal(child)}
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {child.milestones && child.milestones.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {child.milestones
                      .slice()
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((milestone) => {
                        const categories = {
                          physical: "🏃 Fizikai",
                          cognitive: "🧠 Kognitív",
                          social: "👥 Szociális",
                          language: "💬 Nyelvi",
                          other: "⭐ Egyéb",
                        };
                        return (
                          <div
                            key={milestone.id}
                            className="bg-white p-3 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                    {categories[milestone.category]}
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {new Date(
                                      milestone.date
                                    ).toLocaleDateString("hu-HU")}
                                  </span>
                                </div>
                                <h5 className="font-medium text-sm text-gray-800">
                                  {milestone.title}
                                </h5>
                                {milestone.description && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {milestone.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  deleteMilestone(child.id, milestone.id)
                                }
                                className="ml-2 text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Még nincs rögzített mérföldkő
                  </p>
                )}
              </div>

              {/* Mérések */}
              <div className="p-4 border-t border-gray-200 bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Activity size={16} className="text-green-600" />
                    Magasság & Súly
                  </h4>
                  <button
                    onClick={() => openMeasurementModal(child)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {child.measurements && child.measurements.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {child.measurements
                      .slice()
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 5)
                      .map((measurement) => (
                        <div
                          key={measurement.id}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded"
                        >
                          <div>
                            {measurement.height && (
                              <span className="font-semibold">
                                {measurement.height} cm
                              </span>
                            )}
                            {measurement.height && measurement.weight && (
                              <span className="mx-2">•</span>
                            )}
                            {measurement.weight && (
                              <span className="font-semibold">
                                {measurement.weight} kg
                              </span>
                            )}
                            {measurement.headCircumference && (
                              <span className="ml-2 text-gray-600">
                                👶 {measurement.headCircumference} cm
                              </span>
                            )}
                            <span className="block text-gray-500 mt-1">
                              {new Date(measurement.date).toLocaleDateString(
                                "hu-HU"
                              )}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              deleteMeasurement(child.id, measurement.id)
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Még nincs rögzített mérés
                  </p>
                )}
              </div>

              {child.customFields && child.customFields.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-purple-50">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Egyedi információk
                  </h4>
                  <div className="grid gap-2">
                    {child.customFields.map((field, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-white rounded"
                      >
                        <span className="text-sm font-medium text-purple-900">
                          {field.label}
                        </span>
                        <span className="text-sm text-gray-700">
                          {field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const renderCsalad = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Család</h2>
        <button
          onClick={() => openMemberModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Családtag hozzáadása</span>
          <span className="sm:hidden">Új</span>
        </button>
      </div>

      {data.familyMembers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          <Users size={48} className="mx-auto mb-3 text-gray-400" />
          <p>Még nincs hozzáadott családtag</p>
          <p className="text-sm mt-2">
            Add hozzá az első családtagot a kezdéshez!
          </p>
        </div>
      ) : (
        data.familyMembers.map((member) => {
          const birthDate = member.birthDate
            ? new Date(member.birthDate)
            : null;
          const age = birthDate
            ? new Date().getFullYear() - birthDate.getFullYear()
            : null;
          const isAdult = age && age >= 18;

          return (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {member.relation || "Családtag"} {age && `• ${age} év`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openMemberModal(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setShowDeleteConfirm({
                        type: "member",
                        id: member.id,
                        name: member.name,
                      })
                    }
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Születésnap</p>
                  <p className="font-medium text-gray-800">
                    {birthDate ? birthDate.toLocaleDateString("hu-HU") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Névnap</p>
                  <p className="font-medium text-gray-800">
                    {member.nameDay || "-"}
                  </p>
                </div>
              </div>

              {/* Egészségügyi adatok */}
              {member.medicalInfo && (
                <div className="p-4 border-t border-gray-200 bg-red-50">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    <Heart size={16} className="text-red-600" />
                    Egészségügyi adatok
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {member.medicalInfo.bloodType && (
                      <div>
                        <span className="text-gray-600">Vércsoport:</span>
                        <span className="ml-2 font-semibold text-red-700">
                          {member.medicalInfo.bloodType}
                        </span>
                      </div>
                    )}
                    {member.medicalInfo.tajNumber && (
                      <div>
                        <span className="text-gray-600">TAJ:</span>
                        <span className="ml-2 font-mono text-gray-800">
                          {member.medicalInfo.tajNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {member.medicalInfo.allergies?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-red-700 mb-1">
                        Allergiák:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {member.medicalInfo.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.medicalInfo.diseases?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Betegségek:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {member.medicalInfo.diseases.map((disease, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
                          >
                            {disease}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.medicalInfo.medications?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Állandó gyógyszerek:
                      </p>
                      <div className="space-y-1">
                        {member.medicalInfo.medications.map((med, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-white p-2 rounded"
                          >
                            <span className="font-medium">{med.name}</span>
                            {med.dosage && (
                              <span className="text-gray-600 ml-2">
                                - {med.dosage}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dokumentumok (csak felnőtteknél) */}
              {isAdult && member.documents && (
                <div className="p-4 border-t border-gray-200 bg-blue-50">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    <Package size={16} className="text-blue-600" />
                    Dokumentumok
                  </h4>
                  <div className="space-y-2 text-sm">
                    {member.documents.idCard && (
                      <div className="flex justify-between items-center bg-white p-2 rounded">
                        <span className="text-gray-600">Személyi ig.:</span>
                        <span className="font-medium">
                          {new Date(member.documents.idCard).toLocaleDateString(
                            "hu-HU"
                          )}
                        </span>
                      </div>
                    )}
                    {member.documents.drivingLicense && (
                      <div className="flex justify-between items-center bg-white p-2 rounded">
                        <span className="text-gray-600">Jogosítvány:</span>
                        <span className="font-medium">
                          {new Date(
                            member.documents.drivingLicense
                          ).toLocaleDateString("hu-HU")}
                        </span>
                      </div>
                    )}
                    {member.documents.bankCards?.length > 0 && (
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600 mb-1">Bankkártyák:</p>
                        {member.documents.bankCards.map((card, idx) => {
                          const expiry = new Date(card.expiry);
                          const isExpiring =
                            expiry <=
                            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                          return (
                            <div
                              key={idx}
                              className={`flex justify-between items-center text-xs mt-1 ${
                                isExpiring
                                  ? "text-orange-700 font-semibold"
                                  : ""
                              }`}
                            >
                              <span>{card.name}</span>
                              <span>{expiry.toLocaleDateString("hu-HU")}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vérnyomás napló */}
              <div className="p-4 border-t border-gray-200 bg-pink-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Heart size={16} className="text-pink-600" />
                    Vérnyomás napló
                  </h4>
                  <button
                    onClick={() => openBloodPressureModal(member)}
                    className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {member.bloodPressureLog &&
                member.bloodPressureLog.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {member.bloodPressureLog
                      .slice()
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 5)
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded"
                        >
                          <div>
                            <span className="font-semibold">
                              {entry.systolic}/{entry.diastolic} Hgmm
                            </span>
                            {entry.pulse && (
                              <span className="ml-2 text-gray-600">
                                ♥ {entry.pulse}/perc
                              </span>
                            )}
                            <span className="block text-gray-500 mt-1">
                              {new Date(entry.date).toLocaleDateString("hu-HU")}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              deleteBloodPressure(member.id, entry.id)
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Még nincs rögzített mérés
                  </p>
                )}
              </div>

              {/* Ajándék ötletek */}
              <div className="p-4 border-t border-gray-200 bg-purple-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Gift size={16} className="text-purple-600" />
                    Ajándék ötletek
                  </h4>
                  <button
                    onClick={() => openGiftIdeaModal(member)}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {member.giftIdeas && member.giftIdeas.length > 0 ? (
                  <div className="space-y-2">
                    {member.giftIdeas.map((idea) => {
                      const occasions = {
                        birthday: "🎂 Születésnap",
                        christmas: "🎄 Karácsony",
                        nameday: "📅 Névnap",
                        anniversary: "💍 Évforduló",
                        other: "🎁 Egyéb",
                      };
                      return (
                        <div key={idea.id} className="bg-white p-3 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                  {occasions[idea.occasion]}
                                </span>
                                {idea.price && (
                                  <span className="text-xs font-semibold text-gray-700">
                                    {formatCurrency(idea.price, "HUF")}
                                  </span>
                                )}
                              </div>
                              <h5 className="font-medium text-sm text-gray-800">
                                {idea.name}
                              </h5>
                              {idea.link && (
                                <a
                                  href={idea.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline mt-1 block truncate"
                                >
                                  Link megtekintése
                                </a>
                              )}
                              {idea.notes && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {idea.notes}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteGiftIdea(member.id, idea.id)}
                              className="ml-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Még nincs rögzített ötlet
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderEszkozok = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Eszközök</h2>
        <button
          onClick={() => openDeviceModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Új eszköz</span>
          <span className="sm:hidden">Új</span>
        </button>
      </div>

      {!data.devices || data.devices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          <Package size={48} className="mx-auto mb-3 text-gray-400" />
          <p>Még nincs hozzáadott eszköz</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.devices.map((device) => {
            const warrantyExpiry = device.warrantyExpiry
              ? new Date(device.warrantyExpiry)
              : null;
            const isExpiringSoon =
              warrantyExpiry &&
              warrantyExpiry <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            const isExpired = warrantyExpiry && warrantyExpiry < new Date();

            return (
              <div
                key={device.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Package size={24} className="text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {device.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {device.brand} {device.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDeviceModal(device)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setShowDeleteConfirm({
                          type: "device",
                          id: device.id,
                          name: device.name,
                        })
                      }
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kategória</p>
                    <p className="font-medium text-gray-800 capitalize">
                      {device.category}
                    </p>
                  </div>
                  {device.purchaseDate && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Vásárlás dátuma
                      </p>
                      <p className="font-medium text-gray-800">
                        {new Date(device.purchaseDate).toLocaleDateString(
                          "hu-HU"
                        )}
                      </p>
                    </div>
                  )}
                  {device.warrantyExpiry && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Garancia lejárat
                      </p>
                      <p
                        className={`font-semibold ${
                          isExpired
                            ? "text-red-600"
                            : isExpiringSoon
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {warrantyExpiry.toLocaleDateString("hu-HU")}
                        {isExpired && " (lejárt)"}
                        {isExpiringSoon && !isExpired && " (hamarosan lejár)"}
                      </p>
                    </div>
                  )}
                  {device.price > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ár</p>
                      <p className="font-medium text-gray-800">
                        {device.price.toLocaleString()} Ft
                      </p>
                    </div>
                  )}
                  {device.location && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Hely</p>
                      <p className="font-medium text-gray-800">
                        {device.location}
                      </p>
                    </div>
                  )}
                  {device.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Megjegyzés</p>
                      <p className="text-sm text-gray-700">{device.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderPenzugyek = () => {
    const loans = data.finances?.loans || [];
    const savingGoals = data.finances?.savingGoals || [];
    const investments = data.finances?.investments || [];
    const transactions = data.finances?.transactions || [];

    // Időszűrés
    const filterTransactions = () => {
      const now = new Date();
      return transactions.filter((t) => {
        const tDate = new Date(t.date);
        if (financeTimeFilter === "day") {
          return tDate.toDateString() === now.toDateString();
        } else if (financeTimeFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return tDate >= weekAgo;
        } else if (financeTimeFilter === "month") {
          return (
            tDate.getMonth() === now.getMonth() &&
            tDate.getFullYear() === now.getFullYear()
          );
        } else if (financeTimeFilter === "year") {
          return tDate.getFullYear() === now.getFullYear();
        } else if (financeTimeFilter === "custom") {
          if (customDateRange.start && customDateRange.end) {
            const start = new Date(customDateRange.start);
            const end = new Date(customDateRange.end);
            return tDate >= start && tDate <= end;
          }
        }
        return true;
      });
    };

    const filteredTransactions = filterTransactions();

    // Számítások
    const totalDebt = loans.reduce(
      (sum, l) => sum + (parseFloat(l.currentBalance) || 0),
      0
    );
    const totalMonthlyPayment = loans.reduce(
      (sum, l) => sum + (parseFloat(l.monthlyPayment) || 0),
      0
    );
    const totalSaved = savingGoals.reduce(
      (sum, g) => sum + (parseFloat(g.currentAmount) || 0),
      0
    );
    const totalGoals = savingGoals.reduce(
      (sum, g) => sum + (parseFloat(g.targetAmount) || 0),
      0
    );

    // Befektetések értéke
    const totalInvestments = investments.reduce(
      (sum, inv) =>
        sum + convertToHUF(parseFloat(inv.currentValue) || 0, inv.currency),
      0
    );
    const investmentCost = investments.reduce(
      (sum, inv) =>
        sum + convertToHUF(parseFloat(inv.amount) || 0, inv.currency),
      0
    );
    const investmentProfit = totalInvestments - investmentCost;

    // Bevételek és kiadások
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce(
        (sum, t) => sum + convertToHUF(parseFloat(t.amount), t.currency),
        0
      );
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce(
        (sum, t) => sum + convertToHUF(parseFloat(t.amount), t.currency),
        0
      );
    const balance = income - expenses;

    // Előfizetések - többvalutás
    const totalSubscriptions = (data.subscriptions || [])
      .filter((s) => s.active)
      .reduce(
        (sum, s) =>
          sum + convertToHUF(parseFloat(s.monthlyPrice), s.currency || "HUF"),
        0
      );

    const savingCategories = {
      vacation: {
        name: "Nyaralás",
        icon: "✈️",
        color: "bg-blue-100 text-blue-700",
      },
      car: { name: "Autó", icon: "🚗", color: "bg-purple-100 text-purple-700" },
      house: {
        name: "Ingatlan",
        icon: "🏠",
        color: "bg-green-100 text-green-700",
      },
      education: {
        name: "Oktatás",
        icon: "🎓",
        color: "bg-yellow-100 text-yellow-700",
      },
      emergency: {
        name: "Tartalék",
        icon: "🆘",
        color: "bg-red-100 text-red-700",
      },
      electronics: {
        name: "Elektronika",
        icon: "💻",
        color: "bg-indigo-100 text-indigo-700",
      },
      other: { name: "Egyéb", icon: "🎯", color: "bg-gray-100 text-gray-700" },
    };

    const investmentTypes = {
      stock: { name: "Részvény", icon: "📈", color: "text-blue-600" },
      bond: { name: "Kötvény", icon: "📊", color: "text-green-600" },
      crypto: { name: "Kripto", icon: "₿", color: "text-orange-600" },
      real_estate: { name: "Ingatlan", icon: "🏢", color: "text-purple-600" },
      fund: { name: "Alap", icon: "💼", color: "text-indigo-600" },
      other: { name: "Egyéb", icon: "💰", color: "text-gray-600" },
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Pénzügyek</h2>
            <p className="text-sm text-gray-600">Teljes pénzügyi áttekintés</p>
          </div>
        </div>
        {/* Gyors műveletek */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => openTransactionModal("income")}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 shadow-md active:scale-95 transition-transform"
          >
            <Plus size={24} />
            <span className="font-semibold">Bevétel</span>
          </button>
          <button
            onClick={() => openTransactionModal("expense")}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 shadow-md active:scale-95 transition-transform"
          >
            <Plus size={24} />
            <span className="font-semibold">Kiadás</span>
          </button>
        </div>
        {/* Összesítők */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} />
              <span className="text-2xl font-bold">
                {formatCurrency(totalInvestments, "HUF")}
              </span>
            </div>
            <div className="text-sm opacity-90">Befektetések</div>
            <div
              className={`text-xs mt-1 ${
                investmentProfit >= 0 ? "text-green-200" : "text-red-200"
              }`}
            >
              {investmentProfit >= 0 ? "+" : ""}
              {formatCurrency(investmentProfit, "HUF")} hozam
            </div>
          </div>

          <div
            className={`bg-gradient-to-br ${
              balance >= 0
                ? "from-green-500 to-green-600"
                : "from-red-500 to-red-600"
            } rounded-lg shadow-lg p-6 text-white`}
          >
            <div className="flex items-center justify-between mb-2">
              <Activity size={24} />
              <span className="text-2xl font-bold">
                {formatCurrency(Math.abs(balance), "HUF")}
              </span>
            </div>
            <div className="text-sm opacity-90">Egyenleg</div>
            <div className="text-xs opacity-75 mt-1">
              {financeTimeFilter === "day"
                ? "Ma"
                : financeTimeFilter === "week"
                ? "Ezen a héten"
                : financeTimeFilter === "month"
                ? "Ebben a hónapban"
                : "Idén"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={24} />
              <span className="text-2xl font-bold">
                {formatCurrency(income, "HUF")}
              </span>
            </div>
            <div className="text-sm opacity-90">Bevétel</div>
            <div className="text-xs opacity-75 mt-1">
              {filteredTransactions.filter((t) => t.type === "income").length}{" "}
              tranzakció
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart size={24} />
              <span className="text-2xl font-bold">
                {formatCurrency(expenses, "HUF")}
              </span>
            </div>
            <div className="text-sm opacity-90">Kiadás</div>
            <div className="text-xs opacity-75 mt-1">
              {filteredTransactions.filter((t) => t.type === "expense").length}{" "}
              tranzakció
            </div>
          </div>
        </div>
        {/* Számlák */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Package size={20} className="text-indigo-600" />
              Számlák és alszámlák
            </h3>
            <button
              onClick={() => openAccountModal()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Új számla</span>
            </button>
          </div>

          {(data.finances?.accounts || []).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-3 text-gray-400" />
              <p>Még nincs hozzáadott számla</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {(data.finances?.accounts || []).map((account) => {
                const types = {
                  bank: {
                    name: "Bankszámla",
                    icon: "🏦",
                    color: "text-blue-600",
                  },
                  cash: {
                    name: "Készpénz",
                    icon: "💵",
                    color: "text-green-600",
                  },
                  savings: {
                    name: "Megtakarítás",
                    icon: "💰",
                    color: "text-yellow-600",
                  },
                  credit: {
                    name: "Hitelkártya",
                    icon: "💳",
                    color: "text-red-600",
                  },
                  other: { name: "Egyéb", icon: "📦", color: "text-gray-600" },
                };
                const type = types[account.type] || types.other;
                const totalBalance =
                  account.balance +
                  (account.subaccounts?.reduce(
                    (sum, sub) => sum + sub.balance,
                    0
                  ) || 0);

                return (
                  <div key={account.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`text-3xl ${type.color}`}>
                          {type.icon}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {account.name}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded ${type.color} bg-opacity-10`}
                          >
                            {type.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openAccountModal(account)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setShowDeleteConfirm({
                              type: "account",
                              id: account.id,
                              name: account.name,
                            })
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Egyenleg</p>
                        <p className="font-semibold text-gray-800 text-lg">
                          {formatCurrency(account.balance, account.currency)}
                        </p>
                      </div>
                      {account.subaccounts &&
                        account.subaccounts.length > 0 && (
                          <div>
                            <p className="text-gray-600">
                              Teljes egyenleg (alszámlákkal)
                            </p>
                            <p className="font-semibold text-indigo-600 text-lg">
                              {formatCurrency(totalBalance, account.currency)}
                            </p>
                          </div>
                        )}
                    </div>

                    {account.subaccounts && account.subaccounts.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Alszámlák:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {account.subaccounts.map((sub) => (
                            <div
                              key={sub.id}
                              className="bg-gray-50 p-2 rounded"
                            >
                              <p className="text-xs font-medium text-gray-700">
                                {sub.name}
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {formatCurrency(sub.balance, account.currency)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Időszűrő */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-800">Időszak</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["day", "week", "month", "year", "all"].map((filter) => (
              <button
                key={filter}
                onClick={() => setFinanceTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  financeTimeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter === "day" && "Ma"}
                {filter === "week" && "Hét"}
                {filter === "month" && "Hónap"}
                {filter === "year" && "Év"}
                {filter === "all" && "Összes"}
              </button>
            ))}
            <button
              onClick={() => setShowDateRangeModal(true)}
              className="px-4 py-2 rounded-lg font-medium transition bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              📅 Egyedi
            </button>
          </div>
        </div>
        {/* BEFEKTETÉSEK */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Befektetések
            </h3>
            <button
              onClick={() => openInvestmentModal()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Új befektetés</span>
            </button>
          </div>

          {investments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <TrendingUp size={48} className="mx-auto mb-3 text-gray-400" />
              <p>Még nincs rögzített befektetés</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {investments.map((inv) => {
                const type = investmentTypes[inv.type] || investmentTypes.other;
                const currentValueHUF = convertToHUF(
                  parseFloat(inv.currentValue) || 0,
                  inv.currency
                );
                const costHUF = convertToHUF(
                  parseFloat(inv.amount) || 0,
                  inv.currency
                );
                const profitHUF = currentValueHUF - costHUF;
                const profitPercent =
                  costHUF > 0 ? ((profitHUF / costHUF) * 100).toFixed(1) : 0;

                return (
                  <div key={inv.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`text-3xl ${type.color}`}>
                          {type.icon}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {inv.name}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded ${type.color} bg-opacity-10`}
                          >
                            {type.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openInvestmentModal(inv)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setShowDeleteConfirm({
                              type: "investment",
                              id: inv.id,
                              name: inv.name,
                            })
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-gray-600">Aktuális érték</p>
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(inv.currentValue, inv.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Beszerzési ár</p>
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(inv.amount, inv.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Hozam</p>
                        <p
                          className={`font-semibold ${
                            profitHUF >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {profitHUF >= 0 ? "+" : ""}
                          {formatCurrency(profitHUF, "HUF")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Hozam %</p>
                        <p
                          className={`font-semibold ${
                            profitPercent >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {profitPercent >= 0 ? "+" : ""}
                          {profitPercent}%
                        </p>
                      </div>
                    </div>

                    {inv.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {inv.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* TRANZAKCIÓK */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity size={20} className="text-purple-600" />
              Bevételek és kiadások
            </h3>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity size={48} className="mx-auto mb-3 text-gray-400" />
              <p>Nincs tranzakció ebben az időszakban</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredTransactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((transaction) => {
                  const isIncome = transaction.type === "income";
                  const categories = {
                    income: {
                      salary: { name: "Fizetés", icon: "💼" },
                      bonus: { name: "Bónusz", icon: "🎁" },
                      investment: { name: "Befektetés", icon: "📈" },
                      other: { name: "Egyéb", icon: "💰" },
                    },
                    expense: {
                      food: { name: "Élelmiszer", icon: "🍕" },
                      transport: { name: "Közlekedés", icon: "🚗" },
                      entertainment: { name: "Szórakozás", icon: "🎬" },
                      bills: { name: "Számlák", icon: "📄" },
                      health: { name: "Egészség", icon: "💊" },
                      shopping: { name: "Vásárlás", icon: "🛍️" },
                      education: { name: "Oktatás", icon: "📚" },
                      other: { name: "Egyéb", icon: "💸" },
                    },
                  };

                  const category = isIncome
                    ? (settings.customCategories?.finance?.income || []).find(
                        (c) => c.id === transaction.category
                      ) || { name: "Egyéb", icon: "💰" }
                    : (settings.customCategories?.finance?.expense || []).find(
                        (c) => c.id === transaction.category
                      ) || { name: "Egyéb", icon: "💸" };

                  return (
                    <div
                      key={transaction.id}
                      className="p-4 hover:bg-gray-50 flex items-center gap-4"
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-800">
                            {category.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleDateString(
                              "hu-HU"
                            )}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-gray-600">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-lg ${
                            isIncome ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency
                          )}
                        </p>
                        {transaction.currency !== "HUF" && (
                          <p className="text-xs text-gray-500">
                            ≈{" "}
                            {formatCurrency(
                              convertToHUF(
                                transaction.amount,
                                transaction.currency
                              ),
                              "HUF"
                            )}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setShowDeleteConfirm({
                            type: "transaction",
                            id: transaction.id,
                            name: category.name,
                          })
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        {/* HITELEK */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign size={20} className="text-red-600" />
              Hitelek és kölcsönök
            </h3>
            <button
              onClick={() => openLoanModal()}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Új hitel</span>
            </button>
          </div>

          {loans.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <DollarSign size={48} className="mx-auto mb-3 text-gray-400" />
              <p>Nincs felvett hitel</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {loans.map((loan) => {
                const principal = parseFloat(loan.principal) || 0;
                const current = parseFloat(loan.currentBalance) || 0;
                const paidAmount = principal - current;
                const progressPercent =
                  principal > 0
                    ? Math.round((paidAmount / principal) * 100)
                    : 0;

                const endDate = loan.endDate ? new Date(loan.endDate) : null;
                const today = new Date();
                const monthsLeft = endDate
                  ? Math.max(
                      0,
                      Math.ceil((endDate - today) / (1000 * 60 * 60 * 24 * 30))
                    )
                  : null;

                return (
                  <div key={loan.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {loan.name}
                        </h4>
                        {loan.lender && (
                          <p className="text-sm text-gray-600">{loan.lender}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openLoanModal(loan)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setShowDeleteConfirm({
                              type: "loan",
                              id: loan.id,
                              name: loan.name,
                            })
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          Visszafizetve: {progressPercent}%
                        </span>
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(current, "HUF")} maradt
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Havi törlesztő</p>
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(
                            parseFloat(loan.monthlyPayment),
                            "HUF"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Kamat / THM</p>
                        <p className="font-semibold text-gray-800">
                          {loan.interestRate}% / {loan.thm}%
                        </p>
                      </div>
                      {monthsLeft !== null && (
                        <div>
                          <p className="text-gray-600">Hátralévő idő</p>
                          <p className="font-semibold text-gray-800">
                            {monthsLeft} hónap
                          </p>
                        </div>
                      )}
                      {loan.paymentDay && (
                        <div>
                          <p className="text-gray-600">Fizetés</p>
                          <p className="font-semibold text-gray-800">
                            Minden hó {loan.paymentDay}. napján
                          </p>
                        </div>
                      )}
                    </div>

                    {loan.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {loan.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* MEGTAKARÍTÁSI CÉLOK */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Gift size={20} className="text-green-600" />
              Megtakarítási célok
            </h3>
            <button
              onClick={() => openSavingGoalModal()}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Új cél</span>
            </button>
          </div>

          {savingGoals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Gift size={48} className="mx-auto mb-3 text-gray-400" />
              <p>Még nincs megtakarítási cél</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {savingGoals.map((goal) => {
                const current = parseFloat(goal.currentAmount) || 0;
                const target = parseFloat(goal.targetAmount) || 0;
                const progressPercent =
                  target > 0 ? Math.round((current / target) * 100) : 0;
                const remaining = target - current;
                const category =
                  savingCategories[goal.category] || savingCategories.other;

                const deadline = goal.deadline ? new Date(goal.deadline) : null;
                const today = new Date();
                const daysLeft = deadline
                  ? Math.max(
                      0,
                      Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
                    )
                  : null;

                return (
                  <div key={goal.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">{category.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {goal.name}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded ${category.color}`}
                          >
                            {category.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedGoal(goal);
                            setShowDepositModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Befizetés"
                        >
                          <Plus size={18} />
                        </button>
                        <button
                          onClick={() => openSavingGoalModal(goal)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setShowDeleteConfirm({
                              type: "savingGoal",
                              id: goal.id,
                              name: goal.name,
                            })
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          Összegyűjtve: {progressPercent}%
                        </span>
                        <span className="font-semibold text-gray-800">
                          {remaining > 0
                            ? `Még ${formatCurrency(remaining, "HUF")}`
                            : "Célösszeg elérve! 🎉"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            progressPercent >= 100
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(progressPercent, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Jelenlegi összeg</p>
                        <p className="font-semibold text-green-600 text-lg">
                          {formatCurrency(current, "HUF")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Célösszeg</p>
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(target, "HUF")}
                        </p>
                      </div>
                      {daysLeft !== null && (
                        <div>
                          <p className="text-gray-600">Határidő</p>
                          <p className="font-semibold text-gray-800">
                            {daysLeft} nap (
                            {deadline.toLocaleDateString("hu-HU")})
                          </p>
                        </div>
                      )}
                    </div>

                    {goal.deposits && goal.deposits.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium">
                          {goal.deposits.length} befizetés megtekintése
                        </summary>
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          {goal.deposits
                            .slice()
                            .reverse()
                            .map((deposit) => (
                              <div
                                key={deposit.id}
                                className="flex justify-between text-xs p-2 bg-green-50 rounded"
                              >
                                <span>
                                  +{formatCurrency(deposit.amount, "HUF")}
                                </span>
                                <span className="text-gray-600">
                                  {new Date(deposit.date).toLocaleDateString(
                                    "hu-HU"
                                  )}{" "}
                                  • {deposit.addedBy}
                                </span>
                              </div>
                            ))}
                        </div>
                      </details>
                    )}

                    {goal.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {goal.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBevasarlas = () => {
    const uncheckedItems = (data.shoppingList || []).filter(
      (item) => !item.checked
    );
    const checkedItems = (data.shoppingList || []).filter(
      (item) => item.checked
    );

    const categories = {
      élelmiszer: "🥗",
      háztartás: "🧹",
      ruházat: "👕",
      egészség: "💊",
      egyéb: "📦",
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bevásárlólista</h2>
            <p className="text-sm text-gray-600">
              Megosztva a család tagjaival
            </p>
          </div>
          <button
            onClick={() => openShoppingItemModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Új tétel</span>
            <span className="sm:hidden">Új</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Összes tétel</p>
            <p className="text-2xl font-bold text-blue-600">
              {(data.shoppingList || []).length}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Vásárolandó</p>
            <p className="text-2xl font-bold text-orange-600">
              {uncheckedItems.length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Megvéve</p>
            <p className="text-2xl font-bold text-green-600">
              {checkedItems.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Vásárolandó tételek</h3>
            {checkedItems.length > 0 && (
              <button
                onClick={clearCheckedItems}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={16} />
                Megvettek törlése
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200">
            {uncheckedItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart
                  size={48}
                  className="mx-auto mb-3 text-gray-400"
                />
                <p>Minden tétel megvásárolva!</p>
              </div>
            ) : (
              uncheckedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 flex items-center gap-4"
                >
                  <button
                    onClick={() => toggleShoppingItem(item.id)}
                    className="text-gray-400 hover:text-green-600"
                  >
                    <Circle size={24} />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {categories[item.category] || "📦"}
                      </span>
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      {item.priority === "high" && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
                          Sürgős
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span>Mennyiség: {item.quantity}</span>
                      <span>•</span>
                      <span className="capitalize">{item.category}</span>
                      {item.addedBy && (
                        <>
                          <span>•</span>
                          <span>Hozzáadta: {item.addedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteShoppingItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {checkedItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                Megvásárolt tételek
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {checkedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 flex items-center gap-4 opacity-60"
                >
                  <button
                    onClick={() => toggleShoppingItem(item.id)}
                    className="text-green-600"
                  >
                    <CheckCircle size={24} />
                  </button>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 line-through">
                      {item.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => deleteShoppingItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderElofizetesek = () => {
    const categories = {
      streaming: {
        name: "Streaming",
        icon: "🎬",
        color: "bg-red-100 text-red-700",
      },
      music: {
        name: "Zene",
        icon: "🎵",
        color: "bg-purple-100 text-purple-700",
      },
      cloud: {
        name: "Felhő tárhely",
        icon: "☁️",
        color: "bg-blue-100 text-blue-700",
      },
      software: {
        name: "Szoftver",
        icon: "💻",
        color: "bg-green-100 text-green-700",
      },
      news: {
        name: "Hírek/Magazin",
        icon: "📰",
        color: "bg-yellow-100 text-yellow-700",
      },
      telecom: {
        name: "Telekom",
        icon: "📱",
        color: "bg-indigo-100 text-indigo-700",
      },
      fitness: {
        name: "Fitness",
        icon: "💪",
        color: "bg-orange-100 text-orange-700",
      },
      other: { name: "Egyéb", icon: "📦", color: "bg-gray-100 text-gray-700" },
    };

    const subscriptions = data.subscriptions || [];
    const activeSubscriptions = subscriptions.filter((s) => s.active);
    const inactiveSubscriptions = subscriptions.filter((s) => !s.active);

    // Kategóriánkénti csoportosítás
    const groupedByCategory = activeSubscriptions.reduce((acc, sub) => {
      const cat = sub.category || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(sub);
      return acc;
    }, {});

    // Összegzések
    const totalMonthly = activeSubscriptions.reduce(
      (sum, s) => sum + (parseFloat(s.monthlyPrice) || 0),
      0
    );
    const totalYearly = totalMonthly * 12;

    // Próbaidőszakos előfizetések
    const today = new Date();
    const trialSubscriptions = activeSubscriptions.filter((s) => {
      if (!s.trialEnd) return false;
      const trialDate = new Date(s.trialEnd);
      return trialDate > today;
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Előfizetések</h2>
            <p className="text-sm text-gray-600">
              Állandó előfizetések nyilvántartása
            </p>
          </div>
          <button
            onClick={() => openSubscriptionModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Új előfizetés</span>
            <span className="sm:hidden">Új</span>
          </button>
        </div>

        {/* Összesítés */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Repeat size={24} />
              <span className="text-2xl font-bold">
                {activeSubscriptions.length}
              </span>
            </div>
            <div className="text-sm opacity-90">Aktív előfizetés</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={24} />
              <span className="text-2xl font-bold">
                {totalMonthly.toLocaleString()} Ft
              </span>
            </div>
            <div className="text-sm opacity-90">Havi költség</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} />
              <span className="text-2xl font-bold">
                {totalYearly.toLocaleString()} Ft
              </span>
            </div>
            <div className="text-sm opacity-90">Éves költség</div>
          </div>
        </div>

        {/* Próbaidőszakos előfizetések */}
        {trialSubscriptions.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Gift size={18} className="text-orange-600" />
              Próbaidőszakos előfizetések ({trialSubscriptions.length})
            </h3>
            <div className="space-y-2">
              {trialSubscriptions.map((sub) => {
                const trialDate = new Date(sub.trialEnd);
                const daysLeft = Math.ceil(
                  (trialDate - today) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-800">
                        {sub.name}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        Lejár: {trialDate.toLocaleDateString("hu-HU")}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        daysLeft <= 3
                          ? "bg-red-100 text-red-700"
                          : daysLeft <= 7
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {daysLeft} nap
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kategóriák szerint csoportosítva */}
        {Object.keys(groupedByCategory).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            <Repeat size={48} className="mx-auto mb-3 text-gray-400" />
            <p>Még nincs hozzáadott előfizetés</p>
          </div>
        ) : (
          Object.entries(groupedByCategory).map(([catKey, subs]) => {
            const category = categories[catKey];
            const categoryTotal = subs.reduce(
              (sum, s) => sum + (parseFloat(s.monthlyPrice) || 0),
              0
            );

            return (
              <div
                key={catKey}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {subs.length} előfizetés •{" "}
                          {categoryTotal.toLocaleString()} Ft/hó
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}
                    >
                      {categoryTotal.toLocaleString()} Ft
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {subs.map((sub) => {
                    const nextBilling = sub.billingDate
                      ? new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          parseInt(sub.billingDate)
                        )
                      : null;
                    if (nextBilling && nextBilling < today) {
                      nextBilling.setMonth(nextBilling.getMonth() + 1);
                    }

                    return (
                      <div
                        key={sub.id}
                        className="p-4 hover:bg-gray-50 flex items-center gap-4"
                      >
                        <button
                          onClick={() => toggleSubscription(sub.id)}
                          className={`flex-shrink-0 ${
                            sub.active ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {sub.active ? (
                            <CheckCircle size={24} />
                          ) : (
                            <Circle size={24} />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-800">
                              {sub.name}
                            </h4>
                            {sub.trialEnd && new Date(sub.trialEnd) > today && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-medium">
                                Próbaidő
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                            <span className="font-semibold text-blue-600">
                              {parseFloat(sub.monthlyPrice).toLocaleString()}{" "}
                              Ft/hó
                            </span>
                            {nextBilling && (
                              <>
                                <span>•</span>
                                <span>
                                  Következő:{" "}
                                  {nextBilling.toLocaleDateString("hu-HU")}
                                </span>
                              </>
                            )}
                            {sub.notes && (
                              <>
                                <span>•</span>
                                <span className="text-gray-500">
                                  {sub.notes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openSubscriptionModal(sub)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() =>
                              setShowDeleteConfirm({
                                type: "subscription",
                                id: sub.id,
                                name: sub.name,
                              })
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Inaktív előfizetések */}
        {inactiveSubscriptions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                Inaktív előfizetések ({inactiveSubscriptions.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {inactiveSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 hover:bg-gray-50 flex items-center gap-4 opacity-60"
                >
                  <button
                    onClick={() => toggleSubscription(sub.id)}
                    className="text-gray-400"
                  >
                    <Circle size={24} />
                  </button>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 line-through">
                      {sub.name}
                    </h4>
                  </div>
                  <button
                    onClick={() =>
                      setShowDeleteConfirm({
                        type: "subscription",
                        id: sub.id,
                        name: sub.name,
                      })
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNaptar = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNames = [
      "Január",
      "Február",
      "Március",
      "Április",
      "Május",
      "Június",
      "Július",
      "Augusztus",
      "Szeptember",
      "Október",
      "November",
      "December",
    ];
    const dayNames = ["H", "K", "Sz", "Cs", "P", "Sz", "V"];

    const goToPreviousMonth = () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
    };

    const goToNextMonth = () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
    };

    const goToPreviousWeek = () => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    };

    const goToNextWeek = () => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    };

    const goToToday = () => {
      setCurrentDate(new Date());
    };

    if (calendarView === "month") {
      const weeks = getMonthCalendar(currentDate);
      const monthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const monthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      const events = getCalendarEvents(monthStart, monthEnd);

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Naptár</h2>
            <div className="flex gap-2">
              <button
                onClick={() => openEventModal()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <Plus size={18} />
                Esemény
              </button>
              <button
                onClick={() =>
                  setCalendarView(calendarView === "month" ? "week" : "month")
                }
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                {calendarView === "month" ? "Heti nézet" : "Havi nézet"}
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Ma
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h3 className="text-xl font-bold text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-600 py-2 text-sm"
                >
                  {day}
                </div>
              ))}

              {weeks.map((week, weekIdx) =>
                week.map((day, dayIdx) => {
                  const dayEvents = events.filter(
                    (e) => e.date.toDateString() === day.toDateString()
                  );
                  const isToday = day.toDateString() === today.toDateString();
                  const isCurrentMonth =
                    day.getMonth() === currentDate.getMonth();

                  return (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      onClick={() => openEventModal(day)}
                      className={`min-h-24 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        isToday
                          ? "bg-blue-50 border-blue-500"
                          : isCurrentMonth
                          ? "bg-white border-gray-200"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isToday
                            ? "text-blue-600"
                            : isCurrentMonth
                            ? "text-gray-800"
                            : "text-gray-400"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => {
                          const Icon = event.icon;
                          return (
                            <div
                              key={event.id}
                              className={`${
                                event.color
                              } text-white text-xs p-1 rounded flex items-center gap-1 ${
                                event.completed ? "opacity-50 line-through" : ""
                              }`}
                              title={event.title}
                            >
                              <Icon size={12} />
                              <span className="truncate">{event.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-600 font-medium">
                            +{dayEvents.length - 3} további
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // Heti nézet
      const weekDays = getWeekDays(currentDate);
      const weekStart = weekDays[0];
      const weekEnd = weekDays[6];
      const events = getCalendarEvents(weekStart, weekEnd);
      const weekId = getWeekNumber(currentDate);
      const weekNotes = (data.weeklyNotes || []).filter(
        (n) => n.weekId === weekId
      );

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Naptár - Heti nézet
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => openEventModal()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <Plus size={18} />
                Esemény
              </button>
              <button
                onClick={() => setCalendarView("month")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Havi nézet
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Ma
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousWeek}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h3 className="text-lg font-bold text-gray-800">
                {weekStart.toLocaleDateString("hu-HU", {
                  month: "long",
                  day: "numeric",
                })}{" "}
                -
                {weekEnd.toLocaleDateString("hu-HU", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={goToNextWeek}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weekDays.map((day, idx) => {
                const dayEvents = events.filter(
                  (e) => e.date.toDateString() === day.toDateString()
                );
                const isToday = day.toDateString() === today.toDateString();

                return (
                  <div
                    key={idx}
                    onClick={() => openEventModal(day)}
                    className={`border rounded-lg p-3 cursor-pointer hover:shadow-md transition ${
                      isToday
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="text-center mb-3">
                      <div className="text-xs font-medium text-gray-600 uppercase">
                        {dayNames[day.getDay()]}
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          isToday ? "text-blue-600" : "text-gray-800"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {monthNames[day.getMonth()].substring(0, 3)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {dayEvents.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">
                          Nincs esemény
                        </p>
                      ) : (
                        dayEvents.map((event) => {
                          const Icon = event.icon;
                          return (
                            <div
                              key={event.id}
                              className={`${
                                event.color
                              } text-white text-xs p-2 rounded ${
                                event.completed ? "opacity-50" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Icon size={14} />
                                <span className="font-medium">
                                  {event.type}
                                </span>
                              </div>
                              <div
                                className={
                                  event.completed ? "line-through" : ""
                                }
                              >
                                {event.title}
                              </div>
                              {event.assignedTo && (
                                <div className="mt-1 text-xs opacity-80">
                                  → {event.assignedTo}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heti jegyzetek */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Heti jegyzetek</h3>
              <button
                onClick={() => {
                  setFormData({ note: "" });
                  setSelectedWeekNote(null);
                  setShowWeeklyNoteModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus size={16} />
                Új jegyzet
              </button>
            </div>

            {weekNotes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Nincs jegyzet erre a hétre
              </p>
            ) : (
              <div className="space-y-3">
                {weekNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {note.note}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          {note.createdBy} •{" "}
                          {new Date(note.createdAt).toLocaleDateString("hu-HU")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setFormData(note);
                            setSelectedWeekNote(note);
                            setShowWeeklyNoteModal(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteWeeklyNote(note.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  const renderChat = () => {
    const messages = data.chatMessages || [];
    const today = new Date();

    const groupMessagesByDate = (messages) => {
      const grouped = {};
      messages.forEach((msg) => {
        const date = new Date(msg.timestamp).toLocaleDateString("hu-HU");
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(msg);
      });
      return grouped;
    };

    const groupedMessages = groupMessagesByDate(messages);

    const isToday = (date) => {
      const msgDate = new Date(date);
      return msgDate.toDateString() === today.toDateString();
    };

    const isYesterday = (date) => {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const msgDate = new Date(date);
      return msgDate.toDateString() === yesterday.toDateString();
    };

    const formatDateHeader = (dateStr) => {
      const [year, month, day] = dateStr
        .split(". ")
        .map((s) => s.replace(".", ""));
      const date = new Date(year, month - 1, day);

      if (isToday(date)) return "Ma";
      if (isYesterday(date)) return "Tegnap";
      return dateStr;
    };

    return (
      <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Családi Chat</h2>
            <p className="text-sm text-gray-600">
              {messages.length} üzenet • {unreadMessagesCount} olvasatlan
            </p>
          </div>
        </div>

        {/* Chat üzenetek */}
        <div
          id="chat-messages-container"
          className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto p-4 space-y-4 mb-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mail size={64} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium">Még nincs üzenet</p>
              <p className="text-sm">Légy te az első aki ír!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Dátum elválasztó */}
                <div className="flex items-center justify-center my-4">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-xs text-gray-500 font-medium">
                    {formatDateHeader(date)}
                  </span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Üzenetek */}
                {msgs.map((message) => {
                  const isOwn = message.sender === currentUser.email;
                  const time = new Date(message.timestamp).toLocaleTimeString(
                    "hu-HU",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isOwn ? "justify-end" : "justify-start"
                      } mb-3`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          isOwn
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        } rounded-lg px-4 py-2 shadow-sm`}
                      >
                        {!isOwn && (
                          <div className="text-xs font-semibold mb-1 opacity-75">
                            {message.sender}
                          </div>
                        )}
                        <div className="break-words whitespace-pre-wrap">
                          {message.text}
                        </div>
                        <div
                          className={`text-xs mt-1 flex items-center gap-2 ${
                            isOwn ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          <span>{time}</span>
                          {isOwn && (
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="hover:text-red-300 transition"
                              title="Üzenet törlése"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Üzenet küldő */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Írj üzenetet..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end"
            >
              <Mail size={20} />
              <span className="hidden sm:inline">Küldés</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter = küldés • Shift + Enter = új sor
          </p>
        </div>
      </div>
    );
  };

  const renderBeallitasok = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Beállítások</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus size={24} className="text-blue-600" />
          <h3 className="font-semibold text-gray-800">Család kezelése</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Család azonosító</p>
            {data.familyId ? (
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {data.familyId}
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">Betöltés...</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
          >
            <Mail size={20} />
            Családtag meghívása
          </button>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Megosztott hozzáférés</p>
            <p className="text-xs text-gray-500">
              A meghívott családtagok valós időben látják és szerkeszthetik az
              adatokat.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={24} className="text-blue-600" />
          <h3 className="font-semibold text-gray-800">
            Értesítési beállítások
          </h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-700 font-medium">
                Értesítések engedélyezése
              </span>
              <p className="text-sm text-gray-600">
                Automatikus értesítések közelgő határidőkről
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationSettings?.enabled !== false}
              onChange={(e) => {
                const newSettings = {
                  ...settings,
                  notificationSettings: {
                    ...settings.notificationSettings,
                    enabled: e.target.checked,
                  },
                };
                updateSettings(newSettings);
              }}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </label>

          {settings.notificationSettings?.enabled !== false && (
            <>
              <div className="border-t pt-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      settings.notificationSettings?.taskReminders !== false
                    }
                    onChange={(e) => {
                      const newSettings = {
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          taskReminders: e.target.checked,
                        },
                      };
                      updateSettings(newSettings);
                    }}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">Feladat emlékeztetők</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      settings.notificationSettings?.birthdayReminders !== false
                    }
                    onChange={(e) => {
                      const newSettings = {
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          birthdayReminders: e.target.checked,
                        },
                      };
                      updateSettings(newSettings);
                    }}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">
                    Születésnap emlékeztetők
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      settings.notificationSettings?.warrantyReminders !== false
                    }
                    onChange={(e) => {
                      const newSettings = {
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          warrantyReminders: e.target.checked,
                        },
                      };
                      updateSettings(newSettings);
                    }}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-gray-700">Garancia emlékeztetők</span>
                </label>
              </div>

              <div className="border-t pt-4">
                <label className="block">
                  <span className="text-gray-700 font-medium">
                    Emlékeztetés időzítése
                  </span>
                  <p className="text-sm text-gray-600 mb-2">
                    Hány nappal a határidő előtt kapj értesítést
                  </p>
                  <select
                    value={
                      settings.notificationSettings?.daysBeforeReminder || 3
                    }
                    onChange={(e) => {
                      const newSettings = {
                        ...settings,
                        notificationSettings: {
                          ...settings.notificationSettings,
                          daysBeforeReminder: parseInt(e.target.value),
                        },
                      };
                      updateSettings(newSettings);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 nappal korábban</option>
                    <option value="2">2 nappal korábban</option>
                    <option value="3">3 nappal korábban</option>
                    <option value="5">5 nappal korábban</option>
                    <option value="7">7 nappal korábban</option>
                  </select>
                </label>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Modulok kezelése</h3>

        <p className="text-sm text-gray-600 mb-4">
          A fel/le nyilakkal változtathatod a modulok sorrendjét.
        </p>

        <div className="space-y-2">
          {(settings.moduleOrder || getModules().map((m) => m.id))
            .filter((id) => id !== "beallitasok")
            .map((moduleId, index, array) => {
              const modules = getModules();
              const module = modules.find((m) => m.id === moduleId);
              const isActive = settings.activeModules.includes(moduleId);

              return (
                <div
                  key={moduleId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={() => setDraggedModuleIndex(null)}
                  className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move transition-all ${
                    draggedModuleIndex === index ? "opacity-50 scale-95" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="9" cy="5" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="9" cy="19" r="1.5" />
                      <circle cx="15" cy="5" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="15" cy="19" r="1.5" />
                    </svg>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveModule(moduleId, "up")}
                      disabled={index === 0}
                      className="text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveModule(moduleId, "down")}
                      disabled={index === array.length - 1}
                      className="text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => {
                        const newModules = e.target.checked
                          ? [...settings.activeModules, moduleId]
                          : settings.activeModules.filter(
                              (m) => m !== moduleId
                            );
                        updateSettings({
                          ...settings,
                          activeModules: newModules,
                        });
                      }}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span
                      className={`${
                        isActive ? "text-gray-700 font-medium" : "text-gray-400"
                      }`}
                    >
                      {module?.name}
                    </span>
                    {!isActive && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Kikapcsolva
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Mobil navigáció</h3>
        <p className="text-sm text-gray-600 mb-4">
          Válaszd ki, mely 5 modul jelenjen meg az alsó sávban mobilon
        </p>
        <div className="space-y-2">
          {getModules()
            .filter((m) => m.id !== "beallitasok")
            .map((module) => {
              const Icon = module.icon;
              const isSelected =
                settings.mobileBottomNav?.includes(module.id) ||
                (!settings.mobileBottomNav &&
                  [
                    "attekintes",
                    "naptar",
                    "bevasarlas",
                    "penzugyek",
                    "chat",
                  ].includes(module.id));
              const selectedCount = settings.mobileBottomNav?.length || 5;

              return (
                <label
                  key={module.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    isSelected
                      ? "bg-blue-50 border-2 border-blue-500"
                      : "bg-gray-50 border-2 border-transparent hover:border-gray-300"
                  } ${
                    !isSelected && selectedCount >= 5
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!isSelected && selectedCount >= 5}
                    onChange={(e) => {
                      let newBottomNav = settings.mobileBottomNav || [
                        "attekintes",
                        "naptar",
                        "bevasarlas",
                        "penzugyek",
                        "chat",
                      ];

                      if (e.target.checked) {
                        if (newBottomNav.length < 5) {
                          newBottomNav = [...newBottomNav, module.id];
                        }
                      } else {
                        newBottomNav = newBottomNav.filter(
                          (id) => id !== module.id
                        );
                      }

                      updateSettings({
                        ...settings,
                        mobileBottomNav: newBottomNav,
                      });
                    }}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <Icon
                    size={20}
                    className={isSelected ? "text-blue-600" : "text-gray-600"}
                  />
                  <span
                    className={`font-medium ${
                      isSelected ? "text-blue-900" : "text-gray-700"
                    }`}
                  >
                    {module.name}
                  </span>
                  {isSelected && (
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Kiválasztva
                    </span>
                  )}
                </label>
              );
            })}
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-700">
            ℹ️ Maximum 5 modul választható ki a mobil navigációhoz.
            {settings.mobileBottomNav &&
              settings.mobileBottomNav.length < 5 && (
                <span className="font-semibold">
                  {" "}
                  Még {5 - settings.mobileBottomNav.length} hely szabad.
                </span>
              )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Kategóriák testreszabása
          </h3>

          {/* Bevásárlás kategóriák */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">🛒 Bevásárlás</h4>
              <button
                onClick={() => openCategoryModal("shopping")}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {(settings.customCategories?.shopping || []).map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm">
                    {cat.icon} {cat.name}
                  </span>
                  <button
                    onClick={() => deleteCategory("shopping", cat.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bevételek kategóriák */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">💰 Bevételek</h4>
              <button
                onClick={() => openCategoryModal("finance-income")}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {(settings.customCategories?.finance?.income || []).map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm">
                    {cat.icon} {cat.name}
                  </span>
                  <button
                    onClick={() => deleteCategory("finance-income", cat.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Kiadások kategóriák */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">💸 Kiadások</h4>
              <button
                onClick={() => openCategoryModal("finance-expense")}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {(settings.customCategories?.finance?.expense || []).map(
                (cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">
                      {cat.icon} {cat.name}
                    </span>
                    <button
                      onClick={() => deleteCategory("finance-expense", cat.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Profil</h3>
        <p className="text-gray-600">
          Bejelentkezve mint:{" "}
          <span className="font-medium">{currentUser?.email}</span>
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
        >
          <LogOut size={18} />
          Kijelentkezés
        </button>
      </div>
    </div>
  );

  const renderKisallatok = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Kisállatok</h2>
          <button
            onClick={() => openPetModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Új kisállat</span>
            <span className="sm:hidden">Új</span>
          </button>
        </div>

        {!data.pets || data.pets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            <Heart size={48} className="mx-auto mb-3 text-gray-400" />
            <p>Még nincs hozzáadott kisállat</p>
          </div>
        ) : (
          data.pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    {pet.type === "kutya"
                      ? "🐕"
                      : pet.type === "macska"
                      ? "🐈"
                      : "🐾"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{pet.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {pet.breed || pet.type}
                      {pet.birthDate &&
                        ` • ${
                          new Date().getFullYear() -
                          new Date(pet.birthDate).getFullYear()
                        } éves`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openPetModal(pet)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() =>
                      setShowDeleteConfirm({
                        type: "pet",
                        id: pet.id,
                        name: pet.name,
                      })
                    }
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4 grid grid-cols-2 gap-4">
                {pet.chipNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Chip szám</p>
                    <p className="font-medium text-gray-800">
                      {pet.chipNumber}
                    </p>
                  </div>
                )}
                {pet.birthDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Születésnap</p>
                    <p className="font-medium text-gray-800">
                      {new Date(pet.birthDate).toLocaleDateString("hu-HU")}
                    </p>
                  </div>
                )}
              </div>

              {/* Etetési időpontok */}
              {pet.feedingSchedule && pet.feedingSchedule.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-orange-50">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    🍖 Etetési időpontok
                  </h4>
                  <div className="grid gap-2">
                    {pet.feedingSchedule.map((feeding) => (
                      <div
                        key={feeding.id}
                        className="flex justify-between items-center text-sm bg-white p-2 rounded"
                      >
                        <span className="font-medium">{feeding.time}</span>
                        <span className="text-gray-600">
                          {feeding.amount} - {feeding.foodType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Oltások */}
              {pet.vaccinations && pet.vaccinations.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-green-50">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    💉 Oltások
                  </h4>
                  <div className="space-y-2">
                    {pet.vaccinations
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 3)
                      .map((vacc) => (
                        <div
                          key={vacc.id}
                          className="bg-white p-2 rounded text-sm"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{vacc.name}</span>
                            <span className="text-xs text-gray-600">
                              {new Date(vacc.date).toLocaleDateString("hu-HU")}
                            </span>
                          </div>
                          {vacc.nextDate && (
                            <div className="text-xs text-blue-600 mt-1">
                              Következő:{" "}
                              {new Date(vacc.nextDate).toLocaleDateString(
                                "hu-HU"
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Emlékeztetők */}
              {pet.reminders && pet.reminders.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-yellow-50">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    💊 Emlékeztetők
                  </h4>
                  <div className="space-y-2">
                    {pet.reminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="bg-white p-2 rounded text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {reminder.type === "deworming"
                              ? "Féreghajtó"
                              : "Bolhariasztó"}
                          </span>
                          <span className="text-xs text-gray-600">
                            Következő:{" "}
                            {new Date(reminder.nextDate).toLocaleDateString(
                              "hu-HU"
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderReceptek = () => {
    const recipes = data.recipes || [];
    const categories = {
      előétel: "🥗",
      főétel: "🍝",
      desszert: "🍰",
      leves: "🍲",
      saláta: "🥙",
      egyéb: "🍽️",
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Receptek & Menütervezés
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => openRecipeModal()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              Új recept
            </button>
            <button
              onClick={() => setShowWeeklyMenuModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Calendar size={18} />
              Heti menü
            </button>
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            <BookOpen size={48} className="mx-auto mb-3 text-gray-400" />
            <p>Még nincs hozzáadott recept</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer"
                onClick={() => openRecipeModal(recipe)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {categories[recipe.category] || "🍽️"}
                      </span>
                      <h3 className="font-semibold text-gray-800">
                        {recipe.name}
                      </h3>
                    </div>
                    {recipe.favorite && (
                      <span className="text-yellow-500">⭐</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {recipe.prepTime} perc
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      {recipe.servings} adag
                    </span>
                    {recipe.difficulty && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize">
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>

                  {recipe.estimatedCost && (
                    <div className="text-sm text-gray-600 mb-2">
                      Költség: ~{recipe.estimatedCost.toLocaleString()} Ft
                    </div>
                  )}

                  {recipe.allergens && recipe.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {recipe.allergens.map((allergen, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getModules = () => [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "attekintes", name: "Áttekintés", icon: Calendar },
    { id: "naptar", name: "Naptár", icon: Calendar },
    { id: "chat", name: "Chat", icon: Mail }, // ÚJ - helyezd előre hogy látható legyen
    { id: "bevasarlas", name: "Bevásárlás", icon: ShoppingCart },
    { id: "elofizetesek", name: "Előfizetések", icon: Repeat },
    { id: "penzugyek", name: "Pénzügyek", icon: DollarSign },
    { id: "otthon", name: "Otthon", icon: Home },
    { id: "jarmuvek", name: "Járművek", icon: Car },
    { id: "eszkozok", name: "Eszközök", icon: Package },
    { id: "egeszseg", name: "Egészség", icon: Heart },
    { id: "gyerekek", name: "Gyerekek", icon: Baby },
    { id: "csalad", name: "Család", icon: Users },
    { id: "kisallatok", name: "Kisállatok", icon: Heart },
    { id: "receptek", name: "Receptek", icon: BookOpen },
    { id: "beallitasok", name: "Beállítások", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return renderDashboard();
      case "attekintes":
        return renderAttekintes();
      case "naptar":
        return renderNaptar();
      case "otthon":
        return renderOtthon();
      case "jarmuvek":
        return renderJarmuvek();
      case "egeszseg":
        return renderEgeszseg();
      case "gyerekek":
        return renderGyerekek();
      case "csalad":
        return renderCsalad();
      case "eszkozok":
        return renderEszkozok();
      case "bevasarlas":
        return renderBevasarlas();
      case "elofizetesek": // ÚJ
        return renderElofizetesek();
      case "chat":
        return renderChat();
      case "kisallatok":
        return renderKisallatok();
      case "receptek":
        return renderReceptek();
      case "penzugyek":
        return renderPenzugyek();
      case "beallitasok":
        return renderBeallitasok();
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Családszervező
            </h1>
            <p className="text-gray-600">Többfelhasználós családi szervező</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {authError}
            </div>
          )}

          {resetMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              {resetMessage}
            </div>
          )}

          {!showPasswordReset ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@pelda.hu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jelszó
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (isRegister ? handleRegister() : handleLogin())
                    }
                  />
                </div>

                <button
                  onClick={isRegister ? handleRegister : handleLogin}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  {isRegister ? "Regisztráció" : "Bejelentkezés"}
                </button>
              </div>

              <div className="mt-4 flex justify-between items-center text-sm">
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setAuthError("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isRegister ? "Bejelentkezés" : "Regisztráció"}
                </button>

                <button
                  onClick={() => setShowPasswordReset(true)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Elfelejtett jelszó?
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email cím
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@pelda.hu"
                  />
                </div>

                <button
                  onClick={handlePasswordReset}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                >
                  Jelszó visszaállítás küldése
                </button>

                <button
                  onClick={() => {
                    setShowPasswordReset(false);
                    setResetMessage("");
                  }}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  Vissza a bejelentkezéshez
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const modules = getModules();
  const orderedModules = (settings.moduleOrder || modules.map((m) => m.id))
    .map((id) => modules.find((m) => m.id === id))
    .filter(
      (m) =>
        m && (settings.activeModules.includes(m.id) || m.id === "beallitasok")
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <style>{`
      @keyframes checkmark {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); color: #10b981; }
        100% { transform: scale(1); }
      }
      
      .checking {
        animation: checkmark 0.3s ease-in-out;
      }
    `}</style>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-gray-600"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Családszervező</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {currentUser?.email}
            </span>

            {/* Chat gomb */}
            <button
              onClick={() => setActiveModule("chat")}
              className="relative text-gray-600 hover:text-gray-800"
              title="Chat"
            >
              <Mail size={22} />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Értesítések gomb */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-gray-600 hover:text-gray-800 notification-button"
              title="Értesítések"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Beállítások gomb */}
            <button
              onClick={() => {
                setActiveModule("beallitasok");
                setShowMobileMenu(false);
              }}
              className="text-gray-600 hover:text-gray-800"
              title="Beállítások"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>

        {showNotifications && (
          <div className="absolute right-4 top-16 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50 notification-dropdown">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Értesítések</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mind olvasottnak jelöl
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!data.notifications || data.notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-3 text-gray-400" />
                  <p>Nincs értesítés</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {data.notifications
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .map((notification) => {
                      const notifDate = new Date(notification.date);
                      const daysUntil = Math.ceil(
                        (notifDate - new Date()) / (1000 * 60 * 60 * 24)
                      );

                      const getIcon = () => {
                        switch (notification.type) {
                          case "task":
                            return CheckCircle;
                          case "birthday":
                            return Gift;
                          case "maintenance":
                            return Wrench;
                          case "vehicle":
                            return Car;
                          case "health":
                            return Heart;
                          case "warranty":
                            return Package;
                          case "chat": // ÚJ
                            return Mail;
                          default:
                            return Bell;
                        }
                      };

                      const Icon = getIcon();

                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.type === "chat") {
                              setActiveModule("chat");
                              setShowNotifications(false);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                notification.read
                                  ? "bg-gray-100"
                                  : "bg-blue-100"
                              }`}
                            >
                              <Icon
                                size={20}
                                className={
                                  notification.read
                                    ? "text-gray-600"
                                    : "text-blue-600"
                                }
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4
                                  className={`font-medium text-sm ${
                                    !notification.read
                                      ? "text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>
                                  {notifDate.toLocaleDateString("hu-HU")}
                                </span>
                                {daysUntil >= 0 && (
                                  <span
                                    className={`px-2 py-1 rounded ${
                                      daysUntil <= 1
                                        ? "bg-red-100 text-red-700"
                                        : daysUntil <= 3
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {daysUntil === 0
                                      ? "Ma"
                                      : daysUntil === 1
                                      ? "Holnap"
                                      : `${daysUntil} nap múlva`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        <aside
          className={`${
            showMobileMenu ? "block" : "hidden"
          } md:block w-64 bg-white border-r border-gray-200 h-[calc(100vh-57px)] md:min-h-[calc(100vh-57px)] fixed md:sticky top-[57px] left-0 z-20 overflow-y-auto`}
        >
          <nav className="p-4 space-y-2 pb-4">
            {orderedModules
              .filter(
                (module) => module.id !== "chat" && module.id !== "beallitasok"
              )
              .map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      setActiveModule(module.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition relative ${
                      activeModule === module.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{module.name}</span>
                    {module.id === "chat" && unreadMessagesCount > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </aside>

        <main
          className="flex-1 p-4 md:p-8 md:ml-64"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 overflow-x-auto">
        <div className="flex p-2 gap-1 min-w-max">
          {orderedModules
            .filter(
              (module) =>
                settings.mobileBottomNav?.includes(module.id) ||
                (!settings.mobileBottomNav &&
                  [
                    "attekintes",
                    "naptar",
                    "bevasarlas",
                    "penzugyek",
                    "chat",
                  ].includes(module.id))
            )
            .map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition relative min-w-[70px] ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={22} className="mb-1" />
                  <span className="text-xs font-medium truncate max-w-full">
                    {module.name}
                  </span>
                  {module.id === "chat" && unreadMessagesCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadMessagesCount > 9 ? "9" : unreadMessagesCount}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </nav>

      {/* ALL MODALS */}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Új feladat</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feladat neve *
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Határidő *
                </label>
                <input
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Felelős
                </label>
                <select
                  value={formData.assignedTo || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedTo: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nincs hozzárendelve</option>
                  {data.familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={formData.recurring?.enabled || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurring: {
                          ...formData.recurring,
                          enabled: e.target.checked,
                          frequency: formData.recurring?.frequency || "weekly",
                          interval: formData.recurring?.interval || 1,
                        },
                      })
                    }
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <Repeat size={18} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Ismétlődő feladat
                  </span>
                </label>

                {formData.recurring?.enabled && (
                  <div className="pl-7 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gyakoriság
                      </label>
                      <select
                        value={formData.recurring?.frequency || "weekly"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurring: {
                              ...formData.recurring,
                              frequency: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Napi</option>
                        <option value="weekly">Heti</option>
                        <option value="monthly">Havi</option>
                        <option value="yearly">Éves</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minden ... alkalommal
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.recurring?.interval || 1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurring: {
                              ...formData.recurring,
                              interval: parseInt(e.target.value) || 1,
                            },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategória
                </label>
                <select
                  value={formData.category || "otthon"}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="otthon">Otthon</option>
                  <option value="jármű">Jármű</option>
                  <option value="egészség">Egészség</option>
                  <option value="egyéb">Egyéb</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={addTask}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Családtag szerkesztése" : "Új családtag"}
              </h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Alapadatok */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-800">Alapadatok</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Név *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapcsolat
                    </label>
                    <select
                      value={formData.relation || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, relation: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Válassz...</option>
                      <option value="apa">Apa</option>
                      <option value="anya">Anya</option>
                      <option value="gyerek">Gyerek</option>
                      <option value="nagyszülő">Nagyszülő</option>
                      <option value="testvér">Testvér</option>
                      <option value="egyéb">Egyéb</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Születési dátum *
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, birthDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Névnap (HH-NN)
                    </label>
                    <input
                      type="text"
                      placeholder="pl. 06-24"
                      value={formData.nameDay || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, nameDay: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Egészségügyi adatok */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Heart size={18} className="text-red-600" />
                  Egészségügyi adatok
                </h4>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vércsoport
                    </label>
                    <select
                      value={formData.medicalInfo?.bloodType || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalInfo: {
                            ...formData.medicalInfo,
                            bloodType: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Válassz...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="0+">0+</option>
                      <option value="0-">0-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TAJ szám
                    </label>
                    <input
                      type="text"
                      placeholder="123 456 789"
                      value={formData.medicalInfo?.tajNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalInfo: {
                            ...formData.medicalInfo,
                            tajNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Betegségek */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Betegségek
                  </label>
                  {formData.medicalInfo?.diseases?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.medicalInfo.diseases.map((disease, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full"
                        >
                          <span className="text-sm">{disease}</span>
                          <button
                            onClick={() => removeDisease(idx)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Betegség neve"
                      value={tempDisease}
                      onChange={(e) => setTempDisease(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addDisease()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addDisease}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Allergiák */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergiák
                  </label>
                  {formData.medicalInfo?.allergies?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.medicalInfo.allergies.map((allergy, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full"
                        >
                          <span className="text-sm">{allergy}</span>
                          <button
                            onClick={() => removeAllergy(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Allergia neve"
                      value={tempAllergy}
                      onChange={(e) => setTempAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addAllergy()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addAllergy}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Gyógyszerek */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Állandóan szedett gyógyszerek
                  </label>
                  {formData.medicalInfo?.medications?.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {formData.medicalInfo.medications.map((med, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-blue-50 rounded"
                        >
                          <div>
                            <span className="font-medium text-sm">
                              {med.name}
                            </span>
                            {med.dosage && (
                              <span className="text-xs text-gray-600 ml-2">
                                - {med.dosage}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeMedication(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Gyógyszer neve"
                      value={tempMedication.name}
                      onChange={(e) =>
                        setTempMedication({
                          ...tempMedication,
                          name: e.target.value,
                        })
                      }
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Adagolás"
                      value={tempMedication.dosage}
                      onChange={(e) =>
                        setTempMedication({
                          ...tempMedication,
                          dosage: e.target.value,
                        })
                      }
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={addMedication}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={16} /> Gyógyszer hozzáadása
                  </button>
                </div>
              </div>

              {/* Dokumentumok (csak felnőtteknél) */}
              {formData.birthDate &&
                new Date().getFullYear() -
                  new Date(formData.birthDate).getFullYear() >=
                  18 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Package size={18} className="text-blue-600" />
                      Dokumentumok (felnőtt)
                    </h4>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Személyi igazolvány érvényesség
                        </label>
                        <input
                          type="date"
                          value={formData.documents?.idCard || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              documents: {
                                ...formData.documents,
                                idCard: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jogosítvány érvényesség
                        </label>
                        <input
                          type="date"
                          value={formData.documents?.drivingLicense || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              documents: {
                                ...formData.documents,
                                drivingLicense: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Bankkártyák */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bankkártyák
                      </label>
                      {formData.documents?.bankCards?.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {formData.documents.bankCards.map((card, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-green-50 rounded"
                            >
                              <div className="text-sm">
                                <span className="font-medium">{card.name}</span>
                                <span className="text-gray-600 ml-2">
                                  -{" "}
                                  {new Date(card.expiry).toLocaleDateString(
                                    "hu-HU"
                                  )}
                                </span>
                              </div>
                              <button
                                onClick={() => removeBankCard(idx)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Kártya típusa (pl. OTP Visa)"
                          value={tempBankCard.name}
                          onChange={(e) =>
                            setTempBankCard({
                              ...tempBankCard,
                              name: e.target.value,
                            })
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          value={tempBankCard.expiry}
                          onChange={(e) =>
                            setTempBankCard({
                              ...tempBankCard,
                              expiry: e.target.value,
                            })
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={addBankCard}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus size={16} /> Kártya hozzáadása
                      </button>
                    </div>
                  </div>
                )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowMemberModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveMember}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Home Modal */}
      {showHomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Ingatlan szerkesztése" : "Új ingatlan"}
              </h3>
              <button
                onClick={() => setShowHomeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Alapadatok */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Név *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cím
                  </label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Típus
                  </label>
                  <select
                    value={formData.type || "lakás"}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lakás">Lakás</option>
                    <option value="ház">Ház</option>
                    <option value="nyaraló">Nyaraló</option>
                  </select>
                </div>
              </div>

              {/* Mérőórák - ÚJ SZEKCIÓ */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity size={18} className="text-purple-600" />
                  Mérőórák
                </h4>
                {formData.meters && formData.meters.length > 0 && (
                  <div className="space-y-4 mb-4">
                    {formData.meters.map((meter, meterIdx) => (
                      <div
                        key={meterIdx}
                        className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-800">
                                {meter.type}
                              </span>
                              {meter.reminderEnabled && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  📅 Havi emlékeztető
                                </span>
                              )}
                            </div>
                            {meter.serialNumber && (
                              <p className="text-xs text-gray-600">
                                Gyári szám: {meter.serialNumber}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeMeter(meterIdx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Leolvasások */}
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Leolvasások:
                          </p>
                          {meter.readings && meter.readings.length > 0 ? (
                            <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                              {meter.readings.map((reading, readingIdx) => (
                                <div
                                  key={readingIdx}
                                  className="flex items-center justify-between p-2 bg-white rounded text-sm"
                                >
                                  <div>
                                    <span className="font-semibold">
                                      {reading.value} {meter.unit}
                                    </span>
                                    <span className="text-gray-600 ml-2">
                                      {new Date(
                                        reading.date
                                      ).toLocaleDateString("hu-HU")}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      removeMeterReading(meterIdx, readingIdx)
                                    }
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 mb-2">
                              Még nincs leolvasás
                            </p>
                          )}

                          {/* Új leolvasás hozzáadása */}
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={tempReading.date}
                              onChange={(e) =>
                                setTempReading({
                                  ...tempReading,
                                  date: e.target.value,
                                })
                              }
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Érték"
                              value={tempReading.value}
                              onChange={(e) =>
                                setTempReading({
                                  ...tempReading,
                                  value: e.target.value,
                                })
                              }
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={() => addMeterReading(meterIdx)}
                              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Új mérőóra hozzáadása */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Új mérőóra hozzáadása:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={tempMeter.type}
                      onChange={(e) =>
                        setTempMeter({ ...tempMeter, type: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="hideg víz">Hideg víz</option>
                      <option value="meleg víz">Meleg víz</option>
                      <option value="gáz">Gáz</option>
                      <option value="áram">Áram</option>
                      <option value="távhő">Távhő</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Gyári szám (opcionális)"
                      value={tempMeter.serialNumber}
                      onChange={(e) =>
                        setTempMeter({
                          ...tempMeter,
                          serialNumber: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempMeter.reminderEnabled}
                      onChange={(e) =>
                        setTempMeter({
                          ...tempMeter,
                          reminderEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Havi leolvasási emlékeztető
                    </span>
                  </label>
                  <button
                    onClick={addMeter}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Plus size={16} /> Mérőóra hozzáadása
                  </button>
                </div>
              </div>

              {/* Rezsik */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <DollarSign size={18} />
                  Rezsik
                </h4>
                {formData.utilities && formData.utilities.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.utilities.map((utility, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <span className="font-medium text-sm">
                            {utility.name}
                          </span>
                          <span className="text-xs text-gray-600 ml-2">
                            {utility.amount.toLocaleString()} Ft -{" "}
                            {new Date(utility.dueDate).toLocaleDateString(
                              "hu-HU"
                            )}
                          </span>
                        </div>
                        <button
                          onClick={() => removeUtility(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Név"
                    value={tempUtility.name}
                    onChange={(e) =>
                      setTempUtility({ ...tempUtility, name: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Összeg"
                    value={tempUtility.amount}
                    onChange={(e) =>
                      setTempUtility({ ...tempUtility, amount: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="date"
                    value={tempUtility.dueDate}
                    onChange={(e) =>
                      setTempUtility({
                        ...tempUtility,
                        dueDate: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={addUtility}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Rezsi hozzáadása
                </button>
              </div>

              {/* Karbantartások */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Wrench size={18} />
                  Karbantartások
                </h4>
                {formData.maintenance && formData.maintenance.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.maintenance.map((maint, idx) => {
                      const getFrequencyText = () => {
                        if (maint.frequency === "x évente") {
                          return `${maint.customYears} évente`;
                        }
                        return maint.frequency;
                      };

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <span className="font-medium text-sm">
                              {maint.task}
                            </span>
                            <span className="text-xs text-gray-600 ml-2">
                              {new Date(maint.nextDate).toLocaleDateString(
                                "hu-HU"
                              )}{" "}
                              - {getFrequencyText()}
                            </span>
                          </div>
                          <button
                            onClick={() => removeMaintenance(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Feladat"
                      value={tempMaintenance.task}
                      onChange={(e) =>
                        setTempMaintenance({
                          ...tempMaintenance,
                          task: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="date"
                      value={tempMaintenance.nextDate}
                      onChange={(e) =>
                        setTempMaintenance({
                          ...tempMaintenance,
                          nextDate: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={tempMaintenance.frequency}
                      onChange={(e) =>
                        setTempMaintenance({
                          ...tempMaintenance,
                          frequency: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="egyszeri">
                        Egyszeri (nem ismétlődik)
                      </option>
                      <option value="hetente">Hetente</option>
                      <option value="havonta">Havonta</option>
                      <option value="negyedévente">Negyedévente</option>
                      <option value="félévente">Félévente</option>
                      <option value="évente">Évente</option>
                      <option value="x évente">X évente (egyedi)</option>
                    </select>
                    {tempMaintenance.frequency === "x évente" && (
                      <input
                        type="number"
                        min="1"
                        placeholder="Hány évente?"
                        value={tempMaintenance.customYears}
                        onChange={(e) =>
                          setTempMaintenance({
                            ...tempMaintenance,
                            customYears: parseInt(e.target.value) || 1,
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    )}
                  </div>
                </div>
                <button
                  onClick={addMaintenance}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Karbantartás hozzáadása
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowHomeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveHome}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Jármű szerkesztése" : "Új jármű"}
              </h3>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Alap adatok */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-800">Alapadatok</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Típus
                    </label>
                    <select
                      value={formData.type || "autó"}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="autó">Autó</option>
                      <option value="motor">Motor</option>
                      <option value="kerékpár">Kerékpár</option>
                      <option value="roller">Roller</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Név *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Toyota Corolla"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rendszám *
                    </label>
                    <input
                      type="text"
                      value={formData.plate || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, plate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="ABC-123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Km állás
                    </label>
                    <input
                      type="number"
                      value={formData.km || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          km: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Következő szervíz
                    </label>
                    <input
                      type="date"
                      value={formData.nextService || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nextService: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Műszaki
                    </label>
                    <input
                      type="date"
                      value={formData.mot || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, mot: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biztosítás
                    </label>
                    <input
                      type="date"
                      value={formData.insurance || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, insurance: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Km emlékeztető */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.kmReminder?.enabled || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kmReminder: {
                            ...formData.kmReminder,
                            enabled: e.target.checked,
                            lastRecorded:
                              formData.kmReminder?.lastRecorded ||
                              new Date().toISOString(),
                          },
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Havi km rögzítés emlékeztető
                    </span>
                  </label>
                </div>
              </div>

              {/* Gumiabroncsok */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Gumiabroncsok
                </h4>
                {formData.tires && formData.tires.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.tires.map((tire, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">
                            {tire.position} - {tire.type}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {tire.brand} {tire.size}{" "}
                            {tire.manufactureYear &&
                              `(${tire.manufactureYear})`}
                          </div>
                        </div>
                        <button
                          onClick={() => removeTire(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    value={tempTire.position}
                    onChange={(e) =>
                      setTempTire({ ...tempTire, position: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="elöl">Elöl</option>
                    <option value="hátul">Hátul</option>
                    <option value="elöl & hátul">Elöl & Hátul</option>
                    <option value="bal elöl">Bal elöl</option>
                    <option value="jobb elöl">Jobb elöl</option>
                    <option value="bal hátul">Bal hátul</option>
                    <option value="jobb hátul">Jobb hátul</option>
                    <option value="pótkerék">Pótkerék</option>
                  </select>
                  <select
                    value={tempTire.type}
                    onChange={(e) =>
                      setTempTire({ ...tempTire, type: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="négyévszakos">Négyévszakos</option>
                    <option value="nyári">Nyári</option>
                    <option value="téli">Téli</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Méret *"
                    value={tempTire.size}
                    onChange={(e) =>
                      setTempTire({ ...tempTire, size: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Márka"
                    value={tempTire.brand}
                    onChange={(e) =>
                      setTempTire({ ...tempTire, brand: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Gyártási év"
                    value={tempTire.manufactureYear}
                    onChange={(e) =>
                      setTempTire({
                        ...tempTire,
                        manufactureYear: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Profil (mm)"
                    value={tempTire.treadDepth}
                    onChange={(e) =>
                      setTempTire({ ...tempTire, treadDepth: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={addTire}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Gumi hozzáadása
                </button>
              </div>

              {/* Olajcserék */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Olajcserék</h4>
                {formData.oilChanges && formData.oilChanges.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.oilChanges.map((oil, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">
                            {new Date(oil.date).toLocaleDateString("hu-HU")} -{" "}
                            {oil.km?.toLocaleString()} km
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Következő: {oil.nextKm?.toLocaleString()} km vagy{" "}
                            {new Date(oil.nextDate).toLocaleDateString("hu-HU")}
                          </div>
                        </div>
                        <button
                          onClick={() => removeOilChange(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="date"
                    placeholder="Dátum"
                    value={tempOilChange.date}
                    onChange={(e) =>
                      setTempOilChange({
                        ...tempOilChange,
                        date: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Km állás"
                    value={tempOilChange.km}
                    onChange={(e) =>
                      setTempOilChange({ ...tempOilChange, km: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Köv. km (opcionális)"
                    value={tempOilChange.nextKm}
                    onChange={(e) =>
                      setTempOilChange({
                        ...tempOilChange,
                        nextKm: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="date"
                    placeholder="Köv. dátum (opcionális)"
                    value={tempOilChange.nextDate}
                    onChange={(e) =>
                      setTempOilChange({
                        ...tempOilChange,
                        nextDate: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ha nem adod meg, automatikusan +10.000 km és +1 év lesz
                </p>
                <button
                  onClick={addOilChange}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Olajcsere hozzáadása
                </button>
              </div>

              {/* Matricák */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Matricák (autópálya, megye)
                </h4>
                {formData.vignettes && formData.vignettes.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.vignettes.map((vig, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800">
                            {vig.type} - {vig.country}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {new Date(vig.validFrom).toLocaleDateString(
                              "hu-HU"
                            )}{" "}
                            -{" "}
                            {new Date(vig.validUntil).toLocaleDateString(
                              "hu-HU"
                            )}
                            {vig.price && ` • ${vig.price} Ft`}
                          </div>
                        </div>
                        <button
                          onClick={() => removeVignette(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-5 gap-2">
                  <select
                    value={tempVignette.type}
                    onChange={(e) =>
                      setTempVignette({ ...tempVignette, type: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="autópálya">Autópálya</option>
                    <option value="országos">Országos</option>
                    <option value="megyei">Megyei</option>
                    <option value="városi">Városi</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Ország"
                    value={tempVignette.country}
                    onChange={(e) =>
                      setTempVignette({
                        ...tempVignette,
                        country: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="date"
                    placeholder="Érvényes től"
                    value={tempVignette.validFrom}
                    onChange={(e) =>
                      setTempVignette({
                        ...tempVignette,
                        validFrom: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="date"
                    placeholder="Érvényes ig"
                    value={tempVignette.validUntil}
                    onChange={(e) =>
                      setTempVignette({
                        ...tempVignette,
                        validUntil: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Ár (Ft)"
                    value={tempVignette.price}
                    onChange={(e) =>
                      setTempVignette({
                        ...tempVignette,
                        price: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={addVignette}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Matrica hozzáadása
                </button>
              </div>

              {/* Szervíz történet */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Szervíz történet
                </h4>
                {formData.serviceHistory &&
                  formData.serviceHistory.length > 0 && (
                    <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                      {formData.serviceHistory.map((service, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-sm">
                              {service.description}
                            </span>
                            <span className="text-xs text-gray-600 ml-2">
                              {new Date(service.date).toLocaleDateString(
                                "hu-HU"
                              )}
                            </span>
                            {service.cost > 0 && (
                              <span className="text-xs text-blue-600 ml-2 font-semibold">
                                {service.cost.toLocaleString()} Ft
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeServiceEvent(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={tempServiceEvent.date}
                    onChange={(e) =>
                      setTempServiceEvent({
                        ...tempServiceEvent,
                        date: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Leírás"
                    value={tempServiceEvent.description}
                    onChange={(e) =>
                      setTempServiceEvent({
                        ...tempServiceEvent,
                        description: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Költség (Ft)"
                    value={tempServiceEvent.cost}
                    onChange={(e) =>
                      setTempServiceEvent({
                        ...tempServiceEvent,
                        cost: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={addServiceEvent}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Szervíz esemény hozzáadása
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowVehicleModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveVehicle}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Health Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Időpont szerkesztése" : "Új időpont"}
              </h3>
              <button
                onClick={() => setShowHealthModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Személy
                </label>
                <select
                  value={formData.personId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personId: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {data.familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Típus *
                </label>
                <input
                  type="text"
                  placeholder="pl. Fogászat, Háziorvos"
                  value={formData.type || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dátum *
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Helyszín
                </label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefonszám
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowHealthModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveHealthAppointment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Child Modal */}
      {showChildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Gyerek szerkesztése" : "Gyerek hozzáadása"}
              </h3>
              <button
                onClick={() => setShowChildModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Válassz családtagot *
                </label>
                <select
                  value={formData.memberId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      memberId: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Válassz...</option>
                  {data.familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Oltások</h4>
                {formData.vaccinations && formData.vaccinations.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.vaccinations.map((vacc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-green-50 rounded"
                      >
                        <div>
                          <span className="font-medium text-sm">
                            {vacc.name}
                          </span>
                          <span className="text-xs text-gray-600 ml-2">
                            {new Date(vacc.date).toLocaleDateString("hu-HU")}
                          </span>
                        </div>
                        <button
                          onClick={() => removeVaccination(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Oltás neve"
                    value={tempVaccination.name}
                    onChange={(e) =>
                      setTempVaccination({
                        ...tempVaccination,
                        name: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="date"
                    value={tempVaccination.date}
                    onChange={(e) =>
                      setTempVaccination({
                        ...tempVaccination,
                        date: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={addVaccination}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Oltás hozzáadása
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Elfoglaltságok
                </h4>
                {formData.activities && formData.activities.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.activities.map((activity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded"
                      >
                        <div>
                          <span className="font-medium text-sm">
                            {activity.name}
                          </span>
                          <span className="text-xs text-gray-600 ml-2">
                            {activity.schedule}
                          </span>
                        </div>
                        <button
                          onClick={() => removeActivity(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Tevékenység neve"
                    value={tempActivity.name}
                    onChange={(e) =>
                      setTempActivity({ ...tempActivity, name: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Időpont (pl. Hétfő 17:00)"
                    value={tempActivity.schedule}
                    onChange={(e) =>
                      setTempActivity({
                        ...tempActivity,
                        schedule: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={addActivity}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Tevékenység hozzáadása
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Egyedi mezők
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Adj hozzá tetszőleges információkat (pl. Kedvenc szín,
                  Allergiák, Ruha méret, stb.)
                </p>
                {formData.customFields && formData.customFields.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.customFields.map((field, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-purple-50 rounded"
                      >
                        <div>
                          <span className="font-medium text-sm text-purple-900">
                            {field.label}:
                          </span>
                          <span className="text-sm text-gray-700 ml-2">
                            {field.value}
                          </span>
                        </div>
                        <button
                          onClick={() => removeCustomField(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Mező neve (pl. Ruha méret)"
                    value={tempCustomField.label}
                    onChange={(e) =>
                      setTempCustomField({
                        ...tempCustomField,
                        label: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Érték (pl. 110 cm)"
                    value={tempCustomField.value}
                    onChange={(e) =>
                      setTempCustomField({
                        ...tempCustomField,
                        value: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={addCustomField}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Egyedi mező hozzáadása
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowChildModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveChild}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Eszköz szerkesztése" : "Új eszköz"}
              </h3>
              <button
                onClick={() => setShowDeviceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eszköz neve *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategória
                </label>
                <select
                  value={formData.category || "háztartási gép"}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="háztartási gép">Háztartási gép</option>
                  <option value="elektronika">Elektronika</option>
                  <option value="bútor">Bútor</option>
                  <option value="kert">Kert</option>
                  <option value="egyéb">Egyéb</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Márka
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modell
                  </label>
                  <input
                    type="text"
                    value={formData.model || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vásárlás dátuma
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Garancia lejárat
                  </label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        warrantyExpiry: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ár (Ft)
                </label>
                <input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hely (pl. konyha)
                </label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megjegyzés
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeviceModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveDevice}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pet Modal */}
      {showPetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Kisállat szerkesztése" : "Új kisállat"}
              </h3>
              <button
                onClick={() => setShowPetModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Alapadatok */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-800">Alapadatok</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Név *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Típus
                    </label>
                    <select
                      value={formData.type || "kutya"}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="kutya">🐕 Kutya</option>
                      <option value="macska">🐈 Macska</option>
                      <option value="hal">🐠 Hal</option>
                      <option value="madár">🦜 Madár</option>
                      <option value="rágcsáló">🐹 Rágcsáló</option>
                      <option value="hüllő">🦎 Hüllő</option>
                      <option value="egyéb">🐾 Egyéb</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fajta
                    </label>
                    <input
                      type="text"
                      value={formData.breed || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, breed: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Golden Retriever"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Születésnap
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, birthDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Súly (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chip szám
                  </label>
                  <input
                    type="text"
                    value={formData.chipNumber || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, chipNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="123456789012345"
                  />
                </div>
              </div>

              {/* Etetés */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Etetési időpontok
                </h4>
                {formData.feedingSchedule &&
                  formData.feedingSchedule.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formData.feedingSchedule.map((feeding, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-orange-50 rounded"
                        >
                          <div className="text-sm">
                            <span className="font-medium">{feeding.time}</span>
                            <span className="text-gray-600 ml-2">
                              {feeding.amount} - {feeding.foodType}
                            </span>
                          </div>
                          <button
                            onClick={() => removeFeeding(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="time"
                    value={tempFeeding.time}
                    onChange={(e) =>
                      setTempFeeding({ ...tempFeeding, time: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Mennyiség (pl. 200g)"
                    value={tempFeeding.amount}
                    onChange={(e) =>
                      setTempFeeding({ ...tempFeeding, amount: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Táp típusa"
                    value={tempFeeding.foodType}
                    onChange={(e) =>
                      setTempFeeding({
                        ...tempFeeding,
                        foodType: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={addFeeding}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Etetés hozzáadása
                </button>
              </div>

              {/* Oltások */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Oltások</h4>
                {formData.vaccinations && formData.vaccinations.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.vaccinations.map((vacc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-green-50 rounded"
                      >
                        <div className="text-sm">
                          <span className="font-medium">{vacc.name}</span>
                          <span className="text-gray-600 ml-2">
                            {new Date(vacc.date).toLocaleDateString("hu-HU")}
                          </span>
                          {vacc.nextDate && (
                            <span className="text-blue-600 ml-2">
                              →{" "}
                              {new Date(vacc.nextDate).toLocaleDateString(
                                "hu-HU"
                              )}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removePetVaccination(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Oltás neve"
                    value={tempPetVaccination.name}
                    onChange={(e) =>
                      setTempPetVaccination({
                        ...tempPetVaccination,
                        name: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="date"
                    value={tempPetVaccination.date}
                    onChange={(e) =>
                      setTempPetVaccination({
                        ...tempPetVaccination,
                        date: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="date"
                    placeholder="Következő (opcionális)"
                    value={tempPetVaccination.nextDate}
                    onChange={(e) =>
                      setTempPetVaccination({
                        ...tempPetVaccination,
                        nextDate: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={addPetVaccination}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Oltás hozzáadása
                </button>
              </div>

              {/* Állatorvos */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Állatorvos adatai
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Név
                    </label>
                    <input
                      type="text"
                      value={formData.vetInfo?.name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vetInfo: {
                            ...formData.vetInfo,
                            name: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.vetInfo?.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vetInfo: {
                            ...formData.vetInfo,
                            phone: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cím
                    </label>
                    <input
                      type="text"
                      value={formData.vetInfo?.address || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vetInfo: {
                            ...formData.vetInfo,
                            address: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPetModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={savePet}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Item Modal */}
      {showShoppingItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Tétel szerkesztése" : "Új tétel"}
              </h3>
              <button
                onClick={() => setShowShoppingItemModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Termék neve *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Tej"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mennyiség
                  </label>
                  <input
                    type="number"
                    value={formData.quantity || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategória
                  </label>
                  <select
                    value={formData.category || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {(settings.customCategories?.shopping || []).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioritás
                </label>
                <select
                  value={formData.priority || "normal"}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Alacsony</option>
                  <option value="normal">Normál</option>
                  <option value="high">Sürgős</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowShoppingItemModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveShoppingItem}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Előfizetés szerkesztése" : "Új előfizetés"}
              </h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Név *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Netflix, Spotify"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategória
                </label>
                <select
                  value={formData.category || "streaming"}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="streaming">🎬 Streaming</option>
                  <option value="music">🎵 Zene</option>
                  <option value="cloud">☁️ Felhő tárhely</option>
                  <option value="software">💻 Szoftver</option>
                  <option value="news">📰 Hírek/Magazin</option>
                  <option value="telecom">📱 Telekom</option>
                  <option value="fitness">💪 Fitness</option>
                  <option value="other">📦 Egyéb</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Havi díj (Ft) *
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyPrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyPrice: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2990"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valuta
                  </label>
                  <select
                    value={formData.currency || "HUF"}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HUF">Ft (HUF)</option>
                    <option value="EUR">€ (EUR)</option>
                    <option value="USD">$ (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forduló nap
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.billingDate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billingDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próbaidőszak vége
                </label>
                <input
                  type="date"
                  value={formData.trialEnd || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, trialEnd: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ha van ingyenes próbaidőszak, emlékeztetőt kapsz a lejárat
                  előtt
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Szerződés vége (határozott idejű)
                </label>
                <input
                  type="date"
                  value={formData.contractEnd || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, contractEnd: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ha megadod, emlékeztetőt kapsz a lejárat előtt
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoRenew !== false}
                    onChange={(e) =>
                      setFormData({ ...formData, autoRenew: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Automatikus megújítás
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  Ha ki van kapcsolva, feladatot generálunk a megújításhoz
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megjegyzés
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="pl. Családi csomag"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveSubscription}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Investment Modal */}
      {showInvestmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Befektetés szerkesztése" : "Új befektetés"}
              </h3>
              <button
                onClick={() => setShowInvestmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Befektetés neve *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Tesla részvény"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Típus
                </label>
                <select
                  value={formData.type || "stock"}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="stock">📈 Részvény</option>
                  <option value="bond">📊 Kötvény</option>
                  <option value="crypto">₿ Kriptovaluta</option>
                  <option value="real_estate">🏢 Ingatlan</option>
                  <option value="fund">💼 Befektetési alap</option>
                  <option value="other">💰 Egyéb</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beszerzési ár *
                  </label>
                  <input
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valuta
                  </label>
                  <select
                    value={formData.currency || "HUF"}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HUF">Ft (HUF)</option>
                    <option value="EUR">€ (EUR)</option>
                    <option value="USD">$ (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aktuális érték *
                  </label>
                  <input
                    type="number"
                    value={formData.currentValue || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, currentValue: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vásárlás dátuma
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megjegyzés
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowInvestmentModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveInvestment}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {transactionType === "income"
                  ? "Bevétel rögzítése"
                  : "Kiadás rögzítése"}
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategória
                </label>
                <select
                  value={formData.category || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {transactionType === "income" ? (
                    <>
                      {(settings.customCategories?.finance?.income || []).map(
                        (cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        )
                      )}
                    </>
                  ) : (
                    <>
                      {(settings.customCategories?.finance?.expense || []).map(
                        (cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        )
                      )}
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Összeg *
                  </label>
                  <input
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valuta
                  </label>
                  <select
                    value={formData.currency || "HUF"}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HUF">Ft</option>
                    <option value="EUR">€</option>
                    <option value="USD">$</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dátum
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leírás
                </label>
                <input
                  type="text"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Opcionális megjegyzés"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Számla / Alszámla
              </label>
              <select
                value={formData.accountId || ""}
                onChange={(e) => {
                  const [accountId, subaccountId] = e.target.value.split("-");
                  setFormData({
                    ...formData,
                    accountId: accountId ? parseInt(accountId) : null,
                    subaccountId: subaccountId ? parseInt(subaccountId) : null,
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Válassz számlát...</option>
                {(data.finances?.accounts || []).map((account) => (
                  <optgroup key={account.id} label={account.name}>
                    <option value={account.id}>📊 Főszámla</option>
                    {account.subaccounts?.map((sub) => (
                      <option key={sub.id} value={`${account.id}-${sub.id}`}>
                        └─ {sub.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveTransaction}
                className={`flex-1 px-4 py-3 text-white rounded-lg ${
                  transactionType === "income"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Hitel szerkesztése" : "Új hitel"}
              </h3>
              <button
                onClick={() => setShowLoanModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hitel neve *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="pl. Lakáshitel, Autóhitel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hitelező
                  </label>
                  <input
                    type="text"
                    value={formData.lender || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, lender: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="pl. OTP Bank"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eredeti kölcsönösszeg (Ft) *
                  </label>
                  <input
                    type="number"
                    value={formData.principal || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        principal: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jelenlegi tartozás (Ft) *
                  </label>
                  <input
                    type="number"
                    value={formData.currentBalance || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentBalance: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Havi törlesztő (Ft) *
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyPayment || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyPayment: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kamat (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.interestRate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interestRate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    THM (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.thm || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, thm: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kezdő dátum
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lejárat dátuma
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fizetési nap
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.paymentDay || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentDay: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminderEnabled !== false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminderEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Emlékeztető a fizetési határidő előtt
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megjegyzés
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLoanModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveLoan}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saving Goal Modal */}
      {showSavingGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Cél szerkesztése" : "Új megtakarítási cél"}
              </h3>
              <button
                onClick={() => setShowSavingGoalModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cél neve *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Nyaralás Horvátországban"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategória
                </label>
                <select
                  value={formData.category || "vacation"}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vacation">✈️ Nyaralás</option>
                  <option value="car">🚗 Autó</option>
                  <option value="house">🏠 Ingatlan</option>
                  <option value="education">🎓 Oktatás</option>
                  <option value="emergency">🆘 Tartalék</option>
                  <option value="electronics">💻 Elektronika</option>
                  <option value="other">🎯 Egyéb</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Célösszeg (Ft) *
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAmount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jelenlegi összeg (Ft)
                  </label>
                  <input
                    type="number"
                    value={formData.currentAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentAmount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Határidő (opcionális)
                </label>
                <input
                  type="date"
                  value={formData.deadline || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megjegyzés
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSavingGoalModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveSavingGoal}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Befizetés</h3>
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositAmount("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Befizetés ide: <strong>{selectedGoal.name}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Összeg (Ft)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="10000"
                  autoFocus
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <p className="text-gray-700">
                  Jelenlegi:{" "}
                  {(selectedGoal.currentAmount || 0).toLocaleString()} Ft
                </p>
                <p className="text-gray-700">
                  Célösszeg:{" "}
                  {parseFloat(selectedGoal.targetAmount).toLocaleString()} Ft
                </p>
                {depositAmount && parseFloat(depositAmount) > 0 && (
                  <p className="text-green-600 font-semibold mt-2">
                    Új összeg:{" "}
                    {(
                      (selectedGoal.currentAmount || 0) +
                      parseFloat(depositAmount)
                    ).toLocaleString()}{" "}
                    Ft
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositAmount("");
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={addDeposit}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Befizetés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Családtag meghívása
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email cím
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="email@pelda.hu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jogosultság
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="member">Tag - Adatok szerkesztése</option>
                  <option value="admin">Admin - Teljes hozzáférés</option>
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-gray-700">
                  A meghívott személy valós időben láthatja és szerkesztheti a
                  családi adatokat.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={inviteUserToFamily}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Meghívás küldése
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Új esemény</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Esemény neve *
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Családi program"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dátum *
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategória
                </label>
                <select
                  value={formData.type || "egyéb"}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="egyéb">Egyéb</option>
                  <option value="otthon">Otthon</option>
                  <option value="család">Család</option>
                  <option value="munka">Munka</option>
                  <option value="szabadidő">Szabadidő</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leírás
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Opcionális leírás..."
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveEvent}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Note Modal */}
      {showWeeklyNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedWeekNote ? "Jegyzet szerkesztése" : "Új heti jegyzet"}
              </h3>
              <button
                onClick={() => {
                  setShowWeeklyNoteModal(false);
                  setFormData({});
                  setSelectedWeekNote(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jegyzet *
                </label>
                <textarea
                  value={formData.note || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="6"
                  placeholder="Írd le a heti teendőket, megjegyzéseket..."
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowWeeklyNoteModal(false);
                  setFormData({});
                  setSelectedWeekNote(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveWeeklyNote}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick KM Modal */}
      {showKmModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Km állás rögzítése
              </h3>
              <button
                onClick={() => setShowKmModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jármű: <strong>{selectedVehicle.name}</strong>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aktuális km állás *
                </label>
                <input
                  type="number"
                  value={formData.km || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, km: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={`Jelenlegi: ${selectedVehicle.km || 0} km`}
                  autoFocus
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowKmModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveKm}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Service Modal */}
      {showQuickServiceModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Szervíz rögzítése
              </h3>
              <button
                onClick={() => setShowQuickServiceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jármű: <strong>{selectedVehicle.name}</strong>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dátum
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Szervíz leírása *
                </label>
                <input
                  type="text"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Olajcsere, szűrőcsere"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Költség (Ft)
                </label>
                <input
                  type="number"
                  value={formData.cost || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowQuickServiceModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveQuickService}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Meter Reading Modal */}
      {showQuickMeterModal && selectedHome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Mérőóra leolvasás
              </h3>
              <button
                onClick={() => setShowQuickMeterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mérőóra:{" "}
                  <strong>
                    {selectedHome.meters[formData.meterIndex]?.type}
                  </strong>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dátum
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mérőállás *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowQuickMeterModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveQuickMeter}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Maintenance Modal */}
      {showQuickMaintenanceModal && selectedHome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Karbantartás hozzáadása
              </h3>
              <button
                onClick={() => setShowQuickMaintenanceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingatlan: <strong>{selectedHome.name}</strong>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feladat neve *
                </label>
                <input
                  type="text"
                  value={formData.task || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, task: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Kémény tisztítás"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Következő dátum *
                </label>
                <input
                  type="date"
                  value={formData.nextDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nextDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gyakoriság
                </label>
                <select
                  value={formData.frequency || "egyszeri"}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="egyszeri">Egyszeri</option>
                  <option value="hetente">Hetente</option>
                  <option value="havonta">Havonta</option>
                  <option value="negyedévente">Negyedévente</option>
                  <option value="félévente">Félévente</option>
                  <option value="évente">Évente</option>
                  <option value="x évente">X évente</option>
                </select>
              </div>
              {formData.frequency === "x évente" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hány évente?
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.customYears || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customYears: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowQuickMaintenanceModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveQuickMaintenance}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blood Pressure Modal */}
      {showBloodPressureModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Vérnyomás rögzítése
              </h3>
              <button
                onClick={() => setShowBloodPressureModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Személy: <strong>{selectedMember.name}</strong>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dátum
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Szisztolés (felső) *
                  </label>
                  <input
                    type="number"
                    value={formData.systolic || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, systolic: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diasztolés (alsó) *
                  </label>
                  <input
                    type="number"
                    value={formData.diastolic || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, diastolic: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="80"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pulzus (opcionális)
                </label>
                <input
                  type="number"
                  value={formData.pulse || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, pulse: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megjegyzés
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowBloodPressureModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveBloodPressure}
                className="flex-1 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Idea Modal */}
      {showGiftIdeaModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Ajándék ötlet</h3>
              <button
                onClick={() => setShowGiftIdeaModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kinek: <strong>{selectedMember.name}</strong>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alkalom
                </label>
                <select
                  value={formData.occasion || "birthday"}
                  onChange={(e) =>
                    setFormData({ ...formData, occasion: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="birthday">🎂 Születésnap</option>
                  <option value="christmas">🎄 Karácsony</option>
                  <option value="nameday">📅 Névnap</option>
                  <option value="anniversary">💍 Évforduló</option>
                  <option value="other">🎁 Egyéb</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ajándék neve *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Okosóra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link
                </label>
                <input
                  type="url"
                  value={formData.link || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ár (Ft)
                </label>
                <input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megjegyzés
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowGiftIdeaModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveGiftIdea}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Mérföldkő rögzítése
              </h3>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dátum
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategória
                </label>
                <select
                  value={formData.category || "physical"}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="physical">🏃 Fizikai (pl. Első lépés)</option>
                  <option value="cognitive">
                    🧠 Kognitív (pl. Színek felismerése)
                  </option>
                  <option value="social">
                    👥 Szociális (pl. Barátok szerzése)
                  </option>
                  <option value="language">💬 Nyelvi (pl. Első szó)</option>
                  <option value="other">⭐ Egyéb</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Esemény neve *
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Első önálló lépés"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leírás
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Opcionális részletek..."
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveMilestone}
                className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Measurement Modal */}
      {showMeasurementModal && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Mérés rögzítése
              </h3>
              <button
                onClick={() => setShowMeasurementModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dátum
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Magasság (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Súly (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fejkörfogat (cm) - opcionális
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.headCircumference || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headCircumference: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Megjegyzés
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowMeasurementModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveMeasurement}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Számla szerkesztése" : "Új számla"}
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Számla neve *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. OTP Bankszámla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Típus
                </label>
                <select
                  value={formData.type || "bank"}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bank">🏦 Bankszámla</option>
                  <option value="cash">💵 Készpénz</option>
                  <option value="savings">💰 Megtakarítás</option>
                  <option value="credit">💳 Hitelkártya</option>
                  <option value="other">📦 Egyéb</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Egyenleg
                  </label>
                  <input
                    type="number"
                    value={formData.balance || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        balance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valuta
                  </label>
                  <select
                    value={formData.currency || "HUF"}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HUF">Ft (HUF)</option>
                    <option value="EUR">€ (EUR)</option>
                    <option value="USD">$ (USD)</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                  Alszámlák
                </h4>
                {formData.subaccounts && formData.subaccounts.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.subaccounts.map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <span className="font-medium text-sm">
                            {sub.name}
                          </span>
                          <span className="text-xs text-gray-600 ml-2">
                            {formatCurrency(sub.balance, formData.currency)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeSubaccount(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Alszámla neve"
                    value={tempCustomField.label}
                    onChange={(e) =>
                      setTempCustomField({
                        ...tempCustomField,
                        label: e.target.value,
                      })
                    }
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Egyenleg"
                    value={tempCustomField.value}
                    onChange={(e) =>
                      setTempCustomField({
                        ...tempCustomField,
                        value: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={addSubaccount}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Alszámla hozzáadása
                </button>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAccountModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveAccount}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Új kategória</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategória neve *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Háziállat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emoji ikon
                </label>
                <input
                  type="text"
                  value={formData.icon || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="🐕"
                  maxLength="2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tipp: Windows + . vagy Mac ⌘ + Control + Space
                  billentyűkombináció
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveCategory}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Modal */}
      {showDateRangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Egyedi időszak
              </h3>
              <button
                onClick={() => setShowDateRangeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kezdő dátum
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      start: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Záró dátum
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      end: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDateRangeModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={() => {
                  setFinanceTimeFilter("custom");
                  setShowDateRangeModal(false);
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Alkalmaz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Recept szerkesztése" : "Új recept"}
              </h3>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Alapadatok */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-800">Alapadatok</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recept neve *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="pl. Rakott krumpli"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategória
                    </label>
                    <select
                      value={formData.category || "főétel"}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="előétel">🥗 Előétel</option>
                      <option value="főétel">🍝 Főétel</option>
                      <option value="desszert">🍰 Desszert</option>
                      <option value="leves">🍲 Leves</option>
                      <option value="saláta">🥙 Saláta</option>
                      <option value="egyéb">🍽️ Egyéb</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Elkészítési idő (perc)
                    </label>
                    <input
                      type="number"
                      value={formData.prepTime || 30}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prepTime: parseInt(e.target.value) || 30,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adagok száma
                    </label>
                    <input
                      type="number"
                      value={formData.servings || 4}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          servings: parseInt(e.target.value) || 4,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nehézség
                    </label>
                    <select
                      value={formData.difficulty || "közepes"}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="könnyű">Könnyű</option>
                      <option value="közepes">Közepes</option>
                      <option value="nehéz">Nehéz</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Becsült költség (Ft)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedCost || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedCost: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.favorite || false}
                      onChange={(e) =>
                        setFormData({ ...formData, favorite: e.target.checked })
                      }
                      className="w-5 h-5 text-yellow-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      ⭐ Kedvenc recept
                    </span>
                  </label>
                </div>
              </div>

              {/* Hozzávalók */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Hozzávalók *
                </h4>
                {formData.ingredients && formData.ingredients.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-green-50 rounded"
                      >
                        <div className="text-sm">
                          <span className="font-medium">{ing.name}</span>
                          <span className="text-gray-600 ml-2">
                            {ing.amount} {ing.unit}
                          </span>
                        </div>
                        <button
                          onClick={() => removeIngredient(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Hozzávaló neve *"
                    value={tempIngredient.name}
                    onChange={(e) =>
                      setTempIngredient({
                        ...tempIngredient,
                        name: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Mennyiség *"
                    value={tempIngredient.amount}
                    onChange={(e) =>
                      setTempIngredient({
                        ...tempIngredient,
                        amount: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <select
                    value={tempIngredient.unit}
                    onChange={(e) =>
                      setTempIngredient({
                        ...tempIngredient,
                        unit: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="db">db</option>
                    <option value="g">g</option>
                    <option value="dkg">dkg</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="dl">dl</option>
                    <option value="l">l</option>
                    <option value="ek">ek (evőkanál)</option>
                    <option value="kk">kk (kávéskanál)</option>
                    <option value="csipet">csipet</option>
                    <option value="tk">tk (teáskanál)</option>
                    <option value="csomag">csomag</option>
                    <option value="gerezd">gerezd</option>
                  </select>
                </div>
                <button
                  onClick={addIngredient}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Hozzávaló hozzáadása
                </button>
              </div>

              {/* Elkészítés */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Elkészítés lépései
                </h4>
                <textarea
                  value={
                    Array.isArray(formData.instructions)
                      ? formData.instructions.join("\n")
                      : formData.instructions || ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instructions: e.target.value.split("\n"),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="6"
                  placeholder="Írd le a receptet lépésről lépésre... (minden sor egy új lépés)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minden sor egy külön lépésként jelenik meg
                </p>
              </div>

              {/* Allergének */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Allergének</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "glutén",
                    "tojás",
                    "tej",
                    "mogyoró",
                    "szójabab",
                    "hal",
                    "rákfélék",
                    "szezám",
                  ].map((allergen) => (
                    <label
                      key={allergen}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData.allergens?.includes(allergen) || false
                        }
                        onChange={(e) => {
                          const allergens = formData.allergens || [];
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              allergens: [...allergens, allergen],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              allergens: allergens.filter(
                                (a) => a !== allergen
                              ),
                            });
                          }
                        }}
                        className="w-4 h-4 text-red-600 rounded"
                      />
                      <span className="text-sm capitalize">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRecipeModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={saveRecipe}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Törlés megerősítése
            </h3>
            <p className="text-gray-600 mb-6">
              Biztosan törölni szeretnéd:{" "}
              <strong>{showDeleteConfirm.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm.type === "member")
                    deleteMember(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "home")
                    deleteHome(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "vehicle")
                    deleteVehicle(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "health")
                    deleteHealthAppointment(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "child")
                    deleteChild(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "device")
                    deleteDevice(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "subscription")
                    deleteSubscription(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "loan")
                    deleteLoan(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "savingGoal")
                    deleteSavingGoal(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "investment")
                    deleteInvestment(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "transaction")
                    deleteTransaction(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "account")
                    deleteAccount(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "pet")
                    deletePet(showDeleteConfirm.id);
                  else if (showDeleteConfirm.type === "recipe")
                    deleteRecipe(showDeleteConfirm.id);
                }}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Törlés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyOrganizerApp;
