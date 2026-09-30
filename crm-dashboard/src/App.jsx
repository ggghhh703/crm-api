import React, { useEffect, useMemo, useState } from "react";


const API_URL = "https://crm-api-408i.onrender.com";
const TOKEN_KEY = "crm_token";
const USER_KEY = "crm_user";
const THEME_KEY = "crm_dark";

const api = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
};

const getArray = (data, keys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
};

const emptyDeal = {
  title: "",
  customer: "",
  company: "",
  description: "",
  amount: "",
  currency: "INR",
  status: "New",
  stage: "Lead",
  priority: "Medium",
  probability: 0,
  closingDate: "",
  owner: "",
  notes: "",
};

const emptyInteraction = {
  type: "Call",
  subject: "",
  notes: "",
  followUpDate: "",
  createdBy: "Admin",
};

const interactionIcon = (type) => {
  if (type === "Call") return "📞";
  if (type === "WhatsApp") return "💬";
  if (type === "Email") return "📧";
  if (type === "Note") return "📝";
  return "💬";
};

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || ""
  );

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [page, setPage] = useState("Dashboard");
  const [dark, setDark] = useState(
    () => localStorage.getItem(THEME_KEY) === "true"
  );

  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [interactions, setInteractions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customerModal, setCustomerModal] = useState(false);
  const [dealModal, setDealModal] = useState(false);
  const [interactionModal, setInteractionModal] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingDeal, setEditingDeal] = useState(null);

  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [dealForm, setDealForm] = useState(emptyDeal);
  const [interactionForm, setInteractionForm] =
    useState(emptyInteraction);

  const [communicationCustomer, setCommunicationCustomer] =
    useState(null);

  const [communicationOpen, setCommunicationOpen] = useState(false);

  const [
    selectedCustomerForInteraction,
    setSelectedCustomerForInteraction,
  ] = useState(null);

  const [interactionLoading, setInteractionLoading] = useState(false);
  const [search, setSearch] = useState("");

  const theme = dark
    ? {
        bg: "#0f172a",
        card: "#1e293b",
        text: "#f8fafc",
        muted: "#94a3b8",
        border: "#334155",
        input: "#0f172a",
        sidebar: "#020617",
      }
    : {
        bg: "#f1f5f9",
        card: "#ffffff",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        input: "#ffffff",
        sidebar: "#111827",
      };

  useEffect(() => {
    localStorage.setItem(THEME_KEY, String(dark));
  }, [dark]);

  useEffect(() => {
    if (token) {
      loadAll();
    }
  }, [token]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    const name = authForm.name.trim();
    const password = authForm.password;

    if (!name || !password) {
      setAuthError("ID and password are required.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const endpoint =
        authMode === "login" ? "/auth/login" : "/auth/signup";

      const data = await api(endpoint, {
        method: "POST",
        body: JSON.stringify({
          name,
          password,
        }),
      });

      if (!data.token) {
        throw new Error("Authentication token was not received.");
      }

      localStorage.setItem(TOKEN_KEY, data.token);

      if (data.user) {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(data.user)
        );
      }

      setToken(data.token);
      setCurrentUser(data.user || { name });
      setAuthForm({
        name: "",
        password: "",
      });
      setPage("Dashboard");
    } catch (err) {
      console.error(err);
      setAuthError(
        err.message ||
          (authMode === "login"
            ? "Unable to login."
            : "Unable to create account.")
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken("");
    setCurrentUser(null);

    setCustomers([]);
    setDeals([]);
    setInteractions([]);

    setCommunicationOpen(false);
    setCommunicationCustomer(null);
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      const [customerData, dealData] = await Promise.all([
        api("/customers"),
        api("/deals"),
      ]);

      setCustomers(
        getArray(customerData, ["customers", "data"])
      );

      setDeals(getArray(dealData, ["deals", "data"]));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load CRM data");
    } finally {
      setLoading(false);
    }
  };

  const loadInteractions = async (customerId) => {
    if (!customerId) return;

    setInteractionLoading(true);

    try {
      const data = await api(
        `/interactions?customer=${customerId}`
      );

      setInteractions(
        getArray(data, ["interactions", "data"])
      );
    } catch (err) {
      console.error(err);
      setInteractions([]);
      setError(
        err.message || "Unable to load interactions"
      );
    } finally {
      setInteractionLoading(false);
    }
  };

  const openCommunication = async (customer) => {
    setCommunicationCustomer(customer);
    setCommunicationOpen(true);
    await loadInteractions(customer._id);
  };

  const closeCommunication = () => {
    setCommunicationOpen(false);
    setCommunicationCustomer(null);
    setInteractions([]);
  };

  const openAddInteraction = (type = "Call") => {
    if (!communicationCustomer) {
      setError("Please select a customer first.");
      return;
    }

    setSelectedCustomerForInteraction(
      communicationCustomer
    );

    setInteractionForm({
      ...emptyInteraction,
      type,
      createdBy: currentUser?.name || "Admin",
    });

    setInteractionModal(true);
  };

  const saveInteraction = async (e) => {
    e.preventDefault();

    if (!selectedCustomerForInteraction?._id) {
      setError("Customer not selected.");
      return;
    }

    if (!interactionForm.notes.trim()) {
      setError("Please enter interaction notes.");
      return;
    }

    try {
      setError("");

      await api("/interactions", {
        method: "POST",
        body: JSON.stringify({
          customer: selectedCustomerForInteraction._id,
          type: interactionForm.type,
          subject: interactionForm.subject,
          notes: interactionForm.notes,
          followUpDate:
            interactionForm.followUpDate || null,
          createdBy:
            interactionForm.createdBy ||
            currentUser?.name ||
            "Admin",
        }),
      });

      setInteractionModal(false);
      setInteractionForm(emptyInteraction);

      await loadInteractions(
        selectedCustomerForInteraction._id
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Failed to save interaction"
      );
    }
  };

  const deleteInteraction = async (id) => {
    if (!window.confirm("Delete this interaction?")) return;

    try {
      await api(`/interactions/${id}`, {
        method: "DELETE",
      });

      if (communicationCustomer?._id) {
        await loadInteractions(
          communicationCustomer._id
        );
      }
    } catch (err) {
      setError(
        err.message || "Failed to delete interaction"
      );
    }
  };

  const openCall = (customer) => {
    if (!customer?.phone) {
      setError("Customer phone number is missing.");
      return;
    }

    window.location.href = `tel:${customer.phone}`;
  };

  const openWhatsApp = (customer) => {
    if (!customer?.phone) {
      setError("Customer phone number is missing.");
      return;
    }

    let phone = String(customer.phone).replace(
      /\D/g,
      ""
    );

    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    window.open(
      `https://wa.me/${phone}`,
      "_blank"
    );
  };

  const openEmail = (customer) => {
    if (!customer?.email) {
      setError("Customer email is missing.");
      return;
    }

    window.location.href = `mailto:${customer.email}`;
  };

  const openCustomerModal = (customer = null) => {
    setEditingCustomer(customer);

    if (customer) {
      setCustomerForm({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
      });
    } else {
      setCustomerForm(emptyCustomer);
    }

    setCustomerModal(true);
  };

  const saveCustomer = async (e) => {
    e.preventDefault();

    if (
      !customerForm.name.trim() ||
      !customerForm.phone.trim()
    ) {
      setError("Name and phone are required.");
      return;
    }

    try {
      setError("");

      if (editingCustomer) {
        await api(
          `/customers/${editingCustomer._id}`,
          {
            method: "PUT",
            body: JSON.stringify(customerForm),
          }
        );
      } else {
        await api("/customers", {
          method: "POST",
          body: JSON.stringify(customerForm),
        });
      }

      setCustomerModal(false);
      setEditingCustomer(null);
      setCustomerForm(emptyCustomer);

      await loadAll();
    } catch (err) {
      setError(
        err.message || "Failed to save customer"
      );
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await api(`/customers/${id}`, {
        method: "DELETE",
      });

      await loadAll();
    } catch (err) {
      setError(
        err.message || "Failed to delete customer"
      );
    }
  };

  const openDealModal = (deal = null) => {
    setEditingDeal(deal);

    if (deal) {
      setDealForm({
        title: deal.title || "",
        customer:
          typeof deal.customer === "object"
            ? deal.customer?._id || ""
            : deal.customer || "",
        company: deal.company || "",
        description: deal.description || "",
        amount: deal.amount ?? "",
        currency: deal.currency || "INR",
        status: deal.status || "New",
        stage: deal.stage || "Lead",
        priority: deal.priority || "Medium",
        probability: deal.probability ?? 0,
        closingDate: deal.closingDate
          ? String(deal.closingDate).slice(0, 10)
          : "",
        owner:
          deal.owner ||
          currentUser?.name ||
          "",
        notes: deal.notes || "",
      });
    } else {
      setDealForm({
        ...emptyDeal,
        owner: currentUser?.name || "",
      });
    }

    setDealModal(true);
  };

  const saveDeal = async (e) => {
    e.preventDefault();

    if (!dealForm.title.trim()) {
      setError("Deal title is required.");
      return;
    }

    try {
      setError("");

      const payload = {
        ...dealForm,
        amount:
          dealForm.amount === ""
            ? 0
            : Number(dealForm.amount),
        probability: Number(
          dealForm.probability || 0
        ),
      };

      if (editingDeal) {
        await api(`/deals/${editingDeal._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/deals", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setDealModal(false);
      setEditingDeal(null);
      setDealForm(emptyDeal);

      await loadAll();
    } catch (err) {
      setError(
        err.message || "Failed to save deal"
      );
    }
  };

  const deleteDeal = async (id) => {
    if (!window.confirm("Delete this deal?")) return;

    try {
      await api(`/deals/${id}`, {
        method: "DELETE",
      });

      await loadAll();
    } catch (err) {
      setError(
        err.message || "Failed to delete deal"
      );
    }
  };

  const filteredCustomers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return customers;

    return customers.filter((customer) =>
      [
        customer.name,
        customer.phone,
        customer.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [customers, search]);

  const totalRevenue = useMemo(() => {
    return deals
      .filter((deal) => deal.status === "Won")
      .reduce(
        (sum, deal) =>
          sum + Number(deal.amount || 0),
        0
      );
  }, [deals]);

  const activeDeals = deals.filter(
    (deal) =>
      deal.status !== "Won" &&
      deal.status !== "Lost"
  ).length;

  const wonDeals = deals.filter(
    (deal) => deal.status === "Won"
  ).length;

  const lostDeals = deals.filter(
    (deal) => deal.status === "Lost"
  ).length;

  const pipelineValue = deals
    .filter(
      (deal) =>
        deal.status !== "Won" &&
        deal.status !== "Lost"
    )
    .reduce(
      (sum, deal) =>
        sum + Number(deal.amount || 0),
      0
    );

  const navItems = [
    ["Dashboard", "📊"],
    ["Customers", "👥"],
    ["Deals", "💼"],
    ["Tasks", "✅"],
    ["Reports", "📈"],
    ["Settings", "⚙️"],
  ];

  /* LOGIN / SIGNUP SCREEN */

  if (!token) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        form={authForm}
        setForm={setAuthForm}
        loading={authLoading}
        error={authError}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: theme.bg,
        color: theme.text,
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      {/* SIDEBAR */}

      <aside
        style={{
          width: 240,
          minHeight: "100vh",
          background: theme.sidebar,
          color: "#fff",
          padding: 20,
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          🚀 CRM Pro
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: 12,
            marginBottom: 28,
          }}
        >
          Business Management
        </div>

        {navItems.map(([name, icon]) => (
          <button
            key={name}
            type="button"
            onClick={() => setPage(name)}
            style={{
              width: "100%",
              padding: "13px 14px",
              marginBottom: 8,
              border: "none",
              borderRadius: 10,
              textAlign: "left",
              cursor: "pointer",
              background:
                page === name
                  ? "#2563eb"
                  : "transparent",
              color: "#fff",
              fontSize: 15,
              fontWeight:
                page === name ? 700 : 500,
            }}
          >
            {icon} &nbsp; {name}
          </button>
        ))}

        <div
          style={{
            marginTop: 25,
            padding: 14,
            borderRadius: 12,
            background:
              "rgba(255,255,255,0.08)",
            fontSize: 13,
            color: "#cbd5e1",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "#fff",
            }}
          >
            👤 {currentUser?.name || "User"}
          </div>

          <div
            style={{
              marginTop: 8,
              color: "#86efac",
            }}
          >
            ● CRM Connected
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          style={{
            width: "100%",
            marginTop: 15,
            padding: "11px 14px",
            borderRadius: 10,
            border:
              "1px solid rgba(255,255,255,0.12)",
            background:
              "rgba(239,68,68,0.15)",
            color: "#fca5a5",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          🚪 Logout
        </button>
      </aside>

      {/* MAIN */}

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
              }}
            >
              {page}
            </h1>

            <div
              style={{
                color: theme.muted,
                marginTop: 5,
              }}
            >
              Welcome back,{" "}
              <strong>
                {currentUser?.name || "User"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDark(!dark)}
            style={buttonStyle(
              theme,
              "#2563eb"
            )}
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </header>

        {/* ERROR */}

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border:
                "1px solid #fecaca",
              padding: 14,
              borderRadius: 10,
              marginBottom: 18,
              display: "flex",
              justifyContent:
                "space-between",
              gap: 10,
            }}
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* DASHBOARD */}

        {page === "Dashboard" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",
                gap: 18,
                marginBottom: 22,
              }}
            >
              <StatCard
                theme={theme}
                title="Customers"
                value={customers.length}
                icon="👥"
              />

              <StatCard
                theme={theme}
                title="Total Deals"
                value={deals.length}
                icon="💼"
              />

              <StatCard
                theme={theme}
                title="Active Deals"
                value={activeDeals}
                icon="🔥"
              />

              <StatCard
                theme={theme}
                title="Won Deals"
                value={wonDeals}
                icon="🏆"
              />

              <StatCard
                theme={theme}
                title="Pipeline"
                value={`₹${pipelineValue.toLocaleString(
                  "en-IN"
                )}`}
                icon="📈"
              />

              <StatCard
                theme={theme}
                title="Revenue"
                value={`₹${totalRevenue.toLocaleString(
                  "en-IN"
                )}`}
                icon="💰"
              />
            </div>

            <Card theme={theme}>
              <div
                style={
                  sectionHeaderStyle
                }
              >
                <div>
                  <h2 style={{ margin: 0 }}>
                    Recent Deals
                  </h2>

                  <p
                    style={mutedStyle(theme)}
                  >
                    Your latest sales activity
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPage("Deals")
                  }
                  style={buttonStyle(
                    theme,
                    "#2563eb"
                  )}
                >
                  View Deals
                </button>
              </div>

              {loading ? (
                <Loading />
              ) : deals.length === 0 ? (
                <Empty text="No deals found." />
              ) : (
                <SimpleTable
                  theme={theme}
                  headers={[
                    "Title",
                    "Amount",
                    "Status",
                    "Stage",
                    "Priority",
                  ]}
                  rows={deals
                    .slice(0, 8)
                    .map((deal) => [
                      deal.title || "-",
                      `₹${Number(
                        deal.amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}`,
                      deal.status || "-",
                      deal.stage || "-",
                      deal.priority || "-",
                    ])}
                />
              )}
            </Card>
          </>
        )}

        {/* CUSTOMERS */}

        {page === "Customers" && (
          <Card theme={theme}>
            <div
              style={sectionHeaderStyle}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  Customers
                </h2>

                <p
                  style={mutedStyle(theme)}
                >
                  Manage your customers
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  openCustomerModal()
                }
                style={buttonStyle(
                  theme,
                  "#16a34a"
                )}
              >
                + Add Customer
              </button>
            </div>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="🔎 Search customer..."
              style={{
                ...inputStyle(theme),
                marginTop: 18,
              }}
            />

            {loading ? (
              <Loading />
            ) : filteredCustomers.length ===
              0 ? (
              <Empty text="No customers found." />
            ) : (
              <SimpleTable
                theme={theme}
                headers={[
                  "Name",
                  "Phone",
                  "Email",
                  "Communication",
                  "Actions",
                ]}
                rows={filteredCustomers.map(
                  (customer) => [
                    customer.name || "-",
                    customer.phone || "-",
                    customer.email || "-",

                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <SmallButton
                        text="📞"
                        onClick={() =>
                          openCall(customer)
                        }
                      />

                      <SmallButton
                        text="💬"
                        onClick={() =>
                          openWhatsApp(
                            customer
                          )
                        }
                      />

                      <SmallButton
                        text="📧"
                        onClick={() =>
                          openEmail(customer)
                        }
                      />

                      <SmallButton
                        text="📝 History"
                        onClick={() =>
                          openCommunication(
                            customer
                          )
                        }
                      />
                    </div>,

                    <div
                      style={{
                        display: "flex",
                        gap: 7,
                        flexWrap: "wrap",
                      }}
                    >
                      <SmallButton
                        text="Edit"
                        onClick={() =>
                          openCustomerModal(
                            customer
                          )
                        }
                      />

                      <SmallButton
                        text="Delete"
                        danger
                        onClick={() =>
                          deleteCustomer(
                            customer._id
                          )
                        }
                      />
                    </div>,
                  ]
                )}
              />
            )}
          </Card>
        )}

        {/* DEALS */}

        {page === "Deals" && (
          <Card theme={theme}>
            <div
              style={sectionHeaderStyle}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  Deals
                </h2>

                <p
                  style={mutedStyle(theme)}
                >
                  Manage your sales pipeline
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  openDealModal()
                }
                style={buttonStyle(
                  theme,
                  "#16a34a"
                )}
              >
                + Add Deal
              </button>
            </div>

            {loading ? (
              <Loading />
            ) : deals.length === 0 ? (
              <Empty text="No deals found." />
            ) : (
              <SimpleTable
                theme={theme}
                headers={[
                  "Title",
                  "Customer",
                  "Amount",
                  "Status",
                  "Stage",
                  "Priority",
                  "Actions",
                ]}
                rows={deals.map((deal) => [
                  deal.title || "-",

                  typeof deal.customer ===
                  "object"
                    ? deal.customer?.name ||
                      "-"
                    : deal.customer || "-",

                  `₹${Number(
                    deal.amount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}`,

                  deal.status || "-",
                  deal.stage || "-",
                  deal.priority || "-",

                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                    }}
                  >
                    <SmallButton
                      text="Edit"
                      onClick={() =>
                        openDealModal(
                          deal
                        )
                      }
                    />

                    <SmallButton
                      text="Delete"
                      danger
                      onClick={() =>
                        deleteDeal(
                          deal._id
                        )
                      }
                    />
                  </div>,
                ])}
              />
            )}
          </Card>
        )}

        {/* TASKS */}

        {page === "Tasks" && (
          <Card theme={theme}>
            <h2 style={{ marginTop: 0 }}>
              Tasks & Follow-ups
            </h2>

            <p
              style={mutedStyle(theme)}
            >
              Manage customer follow-ups
              through communication
              history.
            </p>

            <div
              style={{
                padding: 20,
                border: `1px dashed ${theme.border}`,
                borderRadius: 12,
                marginTop: 20,
              }}
            >
              <h3>
                📅 Customer Follow-ups
              </h3>

              <p
                style={mutedStyle(theme)}
              >
                Follow-up dates are stored
                inside the Interaction
                system.
              </p>

              <button
                type="button"
                onClick={() =>
                  setPage("Customers")
                }
                style={buttonStyle(
                  theme,
                  "#2563eb"
                )}
              >
                Go to Customers
              </button>
            </div>
          </Card>
        )}

        {/* REPORTS */}

        {page === "Reports" && (
          <Card theme={theme}>
            <h2 style={{ marginTop: 0 }}>
              Reports
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(200px,1fr))",
                gap: 15,
                marginTop: 20,
              }}
            >
              <ReportBox
                theme={theme}
                title="Total Customers"
                value={customers.length}
              />

              <ReportBox
                theme={theme}
                title="Total Deals"
                value={deals.length}
              />

              <ReportBox
                theme={theme}
                title="Won Deals"
                value={wonDeals}
              />

              <ReportBox
                theme={theme}
                title="Lost Deals"
                value={lostDeals}
              />

              <ReportBox
                theme={theme}
                title="Active Deals"
                value={activeDeals}
              />

              <ReportBox
                theme={theme}
                title="Pipeline Value"
                value={`₹${pipelineValue.toLocaleString(
                  "en-IN"
                )}`}
              />

              <ReportBox
                theme={theme}
                title="Won Revenue"
                value={`₹${totalRevenue.toLocaleString(
                  "en-IN"
                )}`}
              />
            </div>
          </Card>
        )}

        {/* SETTINGS */}

        {page === "Settings" && (
          <Card theme={theme}>
            <h2 style={{ marginTop: 0 }}>
              Settings
            </h2>

            <div
              style={{
                marginTop: 20,
                display: "grid",
                gap: 15,
              }}
            >
              <div
                style={{
                  padding: 18,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                }}
              >
                <strong>
                  👤 Account
                </strong>

                <div
                  style={{
                    marginTop: 8,
                    color: theme.muted,
                  }}
                >
                  Logged in as:{" "}
                  <strong>
                    {currentUser?.name ||
                      "User"}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  padding: 18,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                }}
              >
                <strong>
                  🔌 API Server
                </strong>

                <div
                  style={{
                    marginTop: 6,
                    color: theme.muted,
                    wordBreak:
                      "break-all",
                  }}
                >
                  {API_URL}
                </div>
              </div>

              <div
                style={{
                  padding: 18,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                }}
              >
                <strong>
                  🎨 Theme
                </strong>

                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setDark(!dark)
                    }
                    style={buttonStyle(
                      theme,
                      "#2563eb"
                    )}
                  >
                    {dark
                      ? "☀️ Switch to Light"
                      : "🌙 Switch to Dark"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: 18,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                }}
              >
                <strong>
                  🔄 CRM Data
                </strong>

                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={loadAll}
                    style={buttonStyle(
                      theme,
                      "#16a34a"
                    )}
                  >
                    🔄 Refresh CRM Data
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: 18,
                  border:
                    "1px solid #fecaca",
                  borderRadius: 12,
                  background: dark
                    ? "#450a0a"
                    : "#fef2f2",
                }}
              >
                <strong>
                  🚪 Session
                </strong>

                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={logout}
                    style={buttonStyle(
                      theme,
                      "#dc2626"
                    )}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* CUSTOMER MODAL */}

      {customerModal && (
        <Modal
          title={
            editingCustomer
              ? "Edit Customer"
              : "Add Customer"
          }
          onClose={() =>
            setCustomerModal(false)
          }
          theme={theme}
        >
          <form onSubmit={saveCustomer}>
            <label style={labelStyle}>
              Name *
            </label>

            <input
              value={customerForm.name}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  name: e.target.value,
                })
              }
              style={inputStyle(theme)}
              placeholder="Customer name"
              required
            />

            <label style={labelStyle}>
              Phone *
            </label>

            <input
              value={customerForm.phone}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  phone: e.target.value,
                })
              }
              style={inputStyle(theme)}
              placeholder="Phone number"
              required
            />

            <label style={labelStyle}>
              Email
            </label>

            <input
              type="email"
              value={customerForm.email}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  email: e.target.value,
                })
              }
              style={inputStyle(theme)}
              placeholder="Email address"
            />

            <ModalButtons
              onCancel={() =>
                setCustomerModal(false)
              }
              submitText={
                editingCustomer
                  ? "Update Customer"
                  : "Save Customer"
              }
            />
          </form>
        </Modal>
      )}

      {/* DEAL MODAL */}

      {dealModal && (
        <Modal
          title={
            editingDeal
              ? "Edit Deal"
              : "Add Deal"
          }
          onClose={() =>
            setDealModal(false)
          }
          theme={theme}
        >
          <form onSubmit={saveDeal}>
            <label style={labelStyle}>
              Deal Title *
            </label>

            <input
              value={dealForm.title}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  title: e.target.value,
                })
              }
              style={inputStyle(theme)}
              placeholder="Deal title"
              required
            />

            <label style={labelStyle}>
              Customer
            </label>

            <select
              value={dealForm.customer}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  customer: e.target.value,
                })
              }
              style={inputStyle(theme)}
            >
              <option value="">
                Select customer
              </option>

              {customers.map(
                (customer) => (
                  <option
                    key={customer._id}
                    value={customer._id}
                  >
                    {customer.name}
                  </option>
                )
              )}
            </select>

            <label style={labelStyle}>
              Company
            </label>

            <input
              value={dealForm.company}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  company: e.target.value,
                })
              }
              style={inputStyle(theme)}
              placeholder="Company name"
            />

            <label style={labelStyle}>
              Amount
            </label>

            <input
              type="number"
              min="0"
              value={dealForm.amount}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  amount: e.target.value,
                })
              }
              style={inputStyle(theme)}
              placeholder="Amount"
            />

            <label style={labelStyle}>
              Status
            </label>

            <select
              value={dealForm.status}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  status: e.target.value,
                })
              }
              style={inputStyle(theme)}
            >
              <option>New</option>
              <option>In Progress</option>
              <option>Won</option>
              <option>Lost</option>
            </select>

            <label style={labelStyle}>
              Stage
            </label>

            <select
              value={dealForm.stage}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  stage: e.target.value,
                })
              }
              style={inputStyle(theme)}
            >
              <option>Lead</option>
              <option>Qualified</option>
              <option>Proposal</option>
              <option>Negotiation</option>
              <option>Closed Won</option>
              <option>Closed Lost</option>
            </select>

            <label style={labelStyle}>
              Priority
            </label>

            <select
              value={dealForm.priority}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  priority: e.target.value,
                })
              }
              style={inputStyle(theme)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>

            <label style={labelStyle}>
              Probability %
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={dealForm.probability}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  probability: e.target.value,
                })
              }
              style={inputStyle(theme)}
            />

            <label style={labelStyle}>
              Closing Date
            </label>

            <input
              type="date"
              value={dealForm.closingDate}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  closingDate: e.target.value,
                })
              }
              style={inputStyle(theme)}
            />

            <label style={labelStyle}>
              Description
            </label>

            <textarea
              value={dealForm.description}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  description: e.target.value,
                })
              }
              style={{
                ...inputStyle(theme),
                minHeight: 70,
              }}
              placeholder="Deal description"
            />

            <label style={labelStyle}>
              Notes
            </label>

            <textarea
              value={dealForm.notes}
              onChange={(e) =>
                setDealForm({
                  ...dealForm,
                  notes: e.target.value,
                })
              }
              style={{
                ...inputStyle(theme),
                minHeight: 90,
              }}
              placeholder="Deal notes"
            />

            <ModalButtons
              onCancel={() =>
                setDealModal(false)
              }
              submitText={
                editingDeal
                  ? "Update Deal"
                  : "Save Deal"
              }
            />
          </form>
        </Modal>
      )}

      {/* COMMUNICATION PANEL */}

      {communicationOpen &&
        communicationCustomer && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0,0,0,0.55)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "min(900px,100%)",
                maxHeight: "90vh",
                overflowY: "auto",
                background: theme.card,
                color: theme.text,
                borderRadius: 18,
                padding: 24,
                boxSizing: "border-box",
                boxShadow:
                  "0 25px 70px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: 15,
                  marginBottom: 20,
                }}
              >
                <div>
                  <h2
                    style={{ margin: 0 }}
                  >
                    Communication
                  </h2>

                  <div
                    style={{
                      color: theme.muted,
                      marginTop: 5,
                    }}
                  >
                    {communicationCustomer.name}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    closeCommunication
                  }
                  style={closeButton}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(130px,1fr))",
                  gap: 10,
                  marginBottom: 25,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    openCall(
                      communicationCustomer
                    )
                  }
                  style={commButton(
                    "#2563eb"
                  )}
                >
                  📞 Call
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openWhatsApp(
                      communicationCustomer
                    )
                  }
                  style={commButton(
                    "#16a34a"
                  )}
                >
                  💬 WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openEmail(
                      communicationCustomer
                    )
                  }
                  style={commButton(
                    "#7c3aed"
                  )}
                >
                  📧 Email
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openAddInteraction(
                      "Call"
                    )
                  }
                  style={{
                    ...commButton(
                      "#f97316"
                    ),
                    fontWeight: 800,
                  }}
                >
                  📝 + Add Interaction
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                  gap: 10,
                }}
              >
                <h3 style={{ margin: 0 }}>
                  Communication History
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    loadInteractions(
                      communicationCustomer._id
                    )
                  }
                  style={{
                    padding:
                      "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${theme.border}`,
                    background:
                      theme.card,
                    color: theme.text,
                    cursor: "pointer",
                  }}
                >
                  🔄 Refresh
                </button>
              </div>

              {interactionLoading ? (
                <Loading />
              ) : interactions.length ===
                0 ? (
                <div
                  style={{
                    padding: 30,
                    textAlign: "center",
                    border: `1px dashed ${theme.border}`,
                    borderRadius: 12,
                    color: theme.muted,
                  }}
                >
                  No communication
                  history yet.

                  <br />

                  <button
                    type="button"
                    onClick={() =>
                      openAddInteraction(
                        "Note"
                      )
                    }
                    style={{
                      marginTop: 12,
                      padding:
                        "10px 16px",
                      border: "none",
                      borderRadius: 8,
                      background:
                        "#f97316",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    📝 Add First
                    Interaction
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                  }}
                >
                  {interactions.map(
                    (interaction) => (
                      <div
                        key={
                          interaction._id
                        }
                        style={{
                          border: `1px solid ${theme.border}`,
                          borderRadius: 12,
                          padding: 15,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: 10,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 800,
                              }}
                            >
                              {interactionIcon(
                                interaction.type
                              )}{" "}
                              {
                                interaction.type
                              }
                            </div>

                            {interaction.subject && (
                              <div
                                style={{
                                  marginTop: 5,
                                  fontWeight: 600,
                                }}
                              >
                                {
                                  interaction.subject
                                }
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              deleteInteraction(
                                interaction._id
                              )
                            }
                            style={{
                              border: "none",
                              background:
                                "transparent",
                              color:
                                "#dc2626",
                              cursor:
                                "pointer",
                              fontWeight: 700,
                            }}
                          >
                            Delete
                          </button>
                        </div>

                        <p
                          style={{
                            whiteSpace:
                              "pre-wrap",
                            marginBottom: 8,
                          }}
                        >
                          {interaction.notes ||
                            "No notes"}
                        </p>

                        <div
                          style={{
                            fontSize: 12,
                            color:
                              theme.muted,
                          }}
                        >
                          {interaction.createdAt
                            ? new Date(
                                interaction.createdAt
                              ).toLocaleString()
                            : ""}
                        </div>

                        {interaction.followUpDate && (
                          <div
                            style={{
                              marginTop: 7,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            📅 Follow-up:{" "}
                            {new Date(
                              interaction.followUpDate
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      {/* INTERACTION MODAL */}

      {interactionModal && (
        <Modal
          title="Add Interaction"
          onClose={() =>
            setInteractionModal(false)
          }
          theme={theme}
          zIndex={2000}
        >
          <form onSubmit={saveInteraction}>
            <div
              style={{
                background: "#fff7ed",
                color: "#9a3412",
                padding: 12,
                borderRadius: 9,
                marginBottom: 15,
                fontWeight: 600,
              }}
            >
              Customer:{" "}
              {
                selectedCustomerForInteraction?.name
              }
            </div>

            <label style={labelStyle}>
              Interaction Type *
            </label>

            <select
              value={interactionForm.type}
              onChange={(e) =>
                setInteractionForm({
                  ...interactionForm,
                  type: e.target.value,
                })
              }
              style={inputStyle(theme)}
            >
              <option>Call</option>
              <option>WhatsApp</option>
              <option>Email</option>
              <option>Note</option>
            </select>

            <label style={labelStyle}>
              Subject
            </label>

            <input
              value={interactionForm.subject}
              onChange={(e) =>
                setInteractionForm({
                  ...interactionForm,
                  subject: e.target.value,
                })
              }
              style={inputStyle(theme)}
              placeholder="Subject"
            />

            <label style={labelStyle}>
              Notes *
            </label>

            <textarea
              required
              value={interactionForm.notes}
              onChange={(e) =>
                setInteractionForm({
                  ...interactionForm,
                  notes: e.target.value,
                })
              }
              style={{
                ...inputStyle(theme),
                minHeight: 120,
              }}
              placeholder="Write communication details..."
            />

            <label style={labelStyle}>
              Follow-up Date
            </label>

            <input
              type="datetime-local"
              value={
                interactionForm.followUpDate
              }
              onChange={(e) =>
                setInteractionForm({
                  ...interactionForm,
                  followUpDate:
                    e.target.value,
                })
              }
              style={inputStyle(theme)}
            />

            <label style={labelStyle}>
              Created By
            </label>

            <input
              value={
                interactionForm.createdBy
              }
              onChange={(e) =>
                setInteractionForm({
                  ...interactionForm,
                  createdBy: e.target.value,
                })
              }
              style={inputStyle(theme)}
            />

            <ModalButtons
              onCancel={() =>
                setInteractionModal(false)
              }
              submitText="Save Interaction"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

/* AUTH SCREEN */

function AuthScreen({
  mode,
  setMode,
  form,
  setForm,
  loading,
  error,
  onSubmit,
}) {
  const isLogin = mode === "login";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        boxSizing: "border-box",
        background:
          "linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "min(430px,100%)",
          background: "#ffffff",
          borderRadius: 24,
          padding: 30,
          boxSizing: "border-box",
          boxShadow:
            "0 25px 80px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 25,
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 8,
            }}
          >
            🚀
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 30,
              color: "#0f172a",
            }}
          >
            CRM Pro
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: 8,
            }}
          >
            {isLogin
              ? "Login to your CRM"
              : "Create your CRM account"}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border:
                "1px solid #fecaca",
              padding: 12,
              borderRadius: 9,
              marginBottom: 15,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: 7,
              fontWeight: 700,
              color: "#334155",
            }}
          >
            ID
          </label>

          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            placeholder="Enter your ID"
            autoComplete="username"
            minLength={3}
            maxLength={30}
            required
            style={authInputStyle}
          />

          <label
            style={{
              display: "block",
              marginTop: 15,
              marginBottom: 7,
              fontWeight: 700,
              color: "#334155",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            placeholder="Enter your password"
            autoComplete={
              isLogin
                ? "current-password"
                : "new-password"
            }
            minLength={6}
            required
            style={authInputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 22,
              padding: 14,
              border: "none",
              borderRadius: 10,
              background: loading
                ? "#94a3b8"
                : "#2563eb",
              color: "#fff",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "🔐 Login"
              : "🚀 Create Account"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 22,
            color: "#64748b",
            fontSize: 14,
          }}
        >
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setMode(
                isLogin ? "signup" : "login"
              );
            }}
            style={{
              marginLeft: 6,
              border: "none",
              background: "transparent",
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            {isLogin
              ? "Create Account"
              : "Login"}
          </button>
        </div>

        <div
          style={{
            marginTop: 22,
            padding: 12,
            borderRadius: 10,
            background: "#f1f5f9",
            color: "#64748b",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          🔒 Your password is securely
          handled by the CRM backend.
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function Card({ children, theme }) {
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: 22,
        boxShadow:
          "0 4px 15px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  );
}

function StatCard({
  theme,
  title,
  value,
  icon,
}) {
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 15,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 28,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: theme.muted,
          fontSize: 14,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 25,
          fontWeight: 800,
          marginTop: 5,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ReportBox({
  theme,
  title,
  value,
}) {
  return (
    <div
      style={{
        padding: 20,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        background: theme.bg,
      }}
    >
      <div
        style={{
          color: theme.muted,
          fontSize: 14,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          marginTop: 8,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SimpleTable({
  theme,
  headers,
  rows,
}) {
  return (
    <div
      style={{
        overflowX: "auto",
        marginTop: 20,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 650,
        }}
      >
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderBottom: `2px solid ${theme.border}`,
                  color: theme.muted,
                  fontSize: 13,
                  whiteSpace:
                    "nowrap",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map(
                (cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={{
                      padding: 12,
                      borderBottom: `1px solid ${theme.border}`,
                      verticalAlign:
                        "middle",
                    }}
                  >
                    {cell}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SmallButton({
  text,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "7px 10px",
        borderRadius: 7,
        border:
          "1px solid #cbd5e1",
        background: danger
          ? "#fee2e2"
          : "#f8fafc",
        color: danger
          ? "#b91c1c"
          : "#334155",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {text}
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
  theme,
  zIndex = 1500,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        background:
          "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "min(600px,100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: theme.card,
          color: theme.text,
          borderRadius: 16,
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0 }}>
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={closeButton}
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalButtons({
  onCancel,
  submitText,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "flex-end",
        gap: 10,
        marginTop: 20,
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        style={{
          padding: "11px 16px",
          borderRadius: 8,
          border:
            "1px solid #cbd5e1",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>

      <button
        type="submit"
        style={{
          padding: "11px 18px",
          borderRadius: 8,
          border: "none",
          background: "#2563eb",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        {submitText}
      </button>
    </div>
  );
}

function Loading() {
  return (
    <div
      style={{
        padding: 35,
        textAlign: "center",
      }}
    >
      ⏳ Loading...
    </div>
  );
}

function Empty({ text }) {
  return (
    <div
      style={{
        padding: 35,
        textAlign: "center",
        color: "#64748b",
      }}
    >
      {text}
    </div>
  );
}

/* STYLES */

const labelStyle = {
  display: "block",
  marginTop: 14,
  marginBottom: 6,
  fontWeight: 700,
  fontSize: 14,
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15,
  flexWrap: "wrap",
};

const closeButton = {
  width: 36,
  height: 36,
  borderRadius: 9,
  border: "none",
  background: "#e2e8f0",
  color: "#0f172a",
  cursor: "pointer",
  fontSize: 18,
};

const mutedStyle = (theme) => ({
  color: theme.muted,
  marginTop: 5,
});

const inputStyle = (theme) => ({
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 8,
  border: `1px solid ${theme.border}`,
  background: theme.input,
  color: theme.text,
  outline: "none",
  marginBottom: 3,
});

const authInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  outline: "none",
  fontSize: 15,
};

const buttonStyle = (
  theme,
  background
) => ({
  padding: "10px 16px",
  borderRadius: 9,
  border: "none",
  background,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
});

const commButton = (background) => ({
  padding: "13px 10px",
  borderRadius: 10,
  border: "none",
  background,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
});

export default App;