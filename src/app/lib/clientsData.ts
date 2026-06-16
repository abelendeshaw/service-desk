export type ClientStatus = "Active" | "Inactive";

export type ServiceDeskClient = {
  id: string;
  pmCompanyId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: ClientStatus;
  initials: string;
  color: string;
  company: string;
  companyDesc: string;
  tier: "Enterprise" | "Premium" | "Standard";
  industry: string;
  companyPhone: string;
  companyWebsite: string;
  address: string;
};

export type PMCompany = {
  id: string;
  name: string;
  description: string;
  tier: ServiceDeskClient["tier"];
  industry: string;
  website: string;
  phone: string;
  address: string;
  color: string;
  initials: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
};

/** Companies registered in the internal PM product. */
export const pmCompanies: PMCompany[] = [
  {
    id: "pm-epss",
    name: "EPSS",
    description: "Electric Power Systems Services",
    tier: "Enterprise",
    industry: "Energy & Utilities",
    website: "https://epss.example.com",
    phone: "+251 11 555 0001",
    address: "Addis Ababa, Ethiopia",
    color: "#7c3aed",
    initials: "EP",
    primaryContact: {
      name: "Alemu Bekele",
      email: "alemu@epss.com",
      phone: "+251 911 234 567",
      role: "Primary Contact",
    },
  },
  {
    id: "pm-eslse",
    name: "ESLSE",
    description: "Ethiopian Shipping and Logistics Services",
    tier: "Enterprise",
    industry: "Logistics",
    website: "https://eslse.example.com",
    phone: "+251 11 555 0005",
    address: "Addis Ababa, Ethiopia",
    color: "#1d4ed8",
    initials: "ES",
    primaryContact: {
      name: "Hanna Tesfaye",
      email: "contact@eslse.et",
      phone: "+251 911 111 222",
      role: "Primary Contact",
    },
  },
  {
    id: "pm-ie",
    name: "IE",
    description: "Innovation Ethiopia",
    tier: "Enterprise",
    industry: "Technology",
    website: "https://ie.example.com",
    phone: "+251 11 555 0002",
    address: "Addis Ababa, Ethiopia",
    color: "#0891b2",
    initials: "IE",
    primaryContact: {
      name: "Samuel Girma",
      email: "contact@ienetworks.co",
      phone: "+251 922 333 444",
      role: "Technical Contact",
    },
  },
  {
    id: "pm-eotc",
    name: "EOTC",
    description: "Ethiopian Orthodox Tewahedo Church",
    tier: "Standard",
    industry: "Government",
    website: "https://eotc.example.com",
    phone: "+251 11 555 0006",
    address: "Addis Ababa, Ethiopia",
    color: "#7c3aed",
    initials: "EO",
    primaryContact: {
      name: "Father Daniel",
      email: "it@eotc.et",
      phone: "+251 911 555 666",
      role: "Primary Contact",
    },
  },
  {
    id: "pm-eramotl",
    name: "ERA/MOTL",
    description: "Government agency focused on infrastructure",
    tier: "Enterprise",
    industry: "Government",
    website: "https://era.example.com",
    phone: "+251 11 555 0007",
    address: "Addis Ababa, Ethiopia",
    color: "#059669",
    initials: "ER",
    primaryContact: {
      name: "Tigist Worku",
      email: "support@eramotl.com",
      phone: "+251 933 777 888",
      role: "Primary Contact",
    },
  },
  {
    id: "pm-mint",
    name: "MinT",
    description: "Ministry of Innovation and Technology",
    tier: "Enterprise",
    industry: "Government",
    website: "https://mint.example.com",
    phone: "+251 11 555 0008",
    address: "Addis Ababa, Ethiopia",
    color: "#6b7280",
    initials: "MI",
    primaryContact: {
      name: "Selam Tadesse",
      email: "selam@mint.com",
      phone: "+251 922 345 678",
      role: "Technical Contact",
    },
  },
  {
    id: "pm-moti",
    name: "MoTI",
    description: "Ministry of Trade and Industry",
    tier: "Premium",
    industry: "Government",
    website: "https://moti.example.com",
    phone: "+251 11 555 0009",
    address: "Addis Ababa, Ethiopia",
    color: "#6366f1",
    initials: "MO",
    primaryContact: {
      name: "Bereket Haile",
      email: "it@moti.com",
      phone: "+251 911 444 555",
      role: "Primary Contact",
    },
  },
  {
    id: "pm-csa",
    name: "CSA",
    description: "Central Statistics Agency",
    tier: "Enterprise",
    industry: "Government",
    website: "https://csa.example.com",
    phone: "+251 11 555 0003",
    address: "Addis Ababa, Ethiopia",
    color: "#0891b2",
    initials: "CS",
    primaryContact: {
      name: "Mekdes Alemu",
      email: "helpdesk@csa.gov.et",
      phone: "+251 911 666 777",
      role: "Technical Contact",
    },
  },
  {
    id: "pm-abay",
    name: "Abay Bank",
    description: "Private commercial bank",
    tier: "Premium",
    industry: "Banking & Finance",
    website: "https://abay.example.com",
    phone: "+251 11 555 0004",
    address: "Addis Ababa, Ethiopia",
    color: "#dc2626",
    initials: "AB",
    primaryContact: {
      name: "Yonas Bekele",
      email: "it@abaybank.com",
      phone: "+251 911 888 999",
      role: "Primary Contact",
    },
  },
  {
    id: "pm-mows",
    name: "MoWS",
    description: "Ministry of Water and Sanitation",
    tier: "Standard",
    industry: "Government",
    website: "https://mows.example.com",
    phone: "+251 11 555 0010",
    address: "Addis Ababa, Ethiopia",
    color: "#d97706",
    initials: "MW",
    primaryContact: {
      name: "Helen Desta",
      email: "support@mows.gov.et",
      phone: "+251 922 111 333",
      role: "Technical Contact",
    },
  },
  {
    id: "pm-ethio-telecom",
    name: "Ethio Telecom",
    description: "National telecommunications provider",
    tier: "Enterprise",
    industry: "Telecommunications",
    website: "https://ethiotelecom.et",
    phone: "+251 11 555 0020",
    address: "Addis Ababa, Ethiopia",
    color: "#0ea5e9",
    initials: "ET",
    primaryContact: {
      name: "Meron Assefa",
      email: "enterprise@ethiotelecom.et",
      phone: "+251 911 000 111",
      role: "Primary Contact",
    },
  },
  {
    id: "pm-ethiopian",
    name: "Ethiopian Airlines",
    description: "Flag carrier airline group",
    tier: "Enterprise",
    industry: "Logistics",
    website: "https://ethiopianairlines.com",
    phone: "+251 11 555 0021",
    address: "Bole, Addis Ababa, Ethiopia",
    color: "#16a34a",
    initials: "EA",
    primaryContact: {
      name: "Daniel Kebede",
      email: "itops@ethiopianairlines.com",
      phone: "+251 911 222 333",
      role: "Technical Contact",
    },
  },
  {
    id: "pm-aau",
    name: "Addis Ababa University",
    description: "Public research university",
    tier: "Standard",
    industry: "Healthcare",
    website: "https://aau.edu.et",
    phone: "+251 11 555 0022",
    address: "Addis Ababa, Ethiopia",
    color: "#9333ea",
    initials: "AA",
    primaryContact: {
      name: "Dr. Rahel Tesfa",
      email: "ict@aau.edu.et",
      phone: "+251 911 333 444",
      role: "Primary Contact",
    },
  },
  {
    id: "pm-oromia-bank",
    name: "Oromia Bank",
    description: "Regional commercial bank",
    tier: "Premium",
    industry: "Banking & Finance",
    website: "https://oromiabank.com",
    phone: "+251 11 555 0023",
    address: "Addis Ababa, Ethiopia",
    color: "#b45309",
    initials: "OB",
    primaryContact: {
      name: "Fitsum Lemma",
      email: "servicedesk@oromiabank.com",
      phone: "+251 922 555 666",
      role: "Primary Contact",
    },
  },
];

export function getPMCompany(pmCompanyId: string): PMCompany | undefined {
  return pmCompanies.find((c) => c.id === pmCompanyId);
}

export function buildClientFromPM(pm: PMCompany, status: ClientStatus = "Active"): ServiceDeskClient {
  const contact = pm.primaryContact;
  const contactInitials =
    contact.name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || pm.initials;

  return {
    id: contact.email.toLowerCase(),
    pmCompanyId: pm.id,
    name: contact.name,
    email: contact.email.toLowerCase(),
    phone: contact.phone,
    role: contact.role,
    status,
    initials: contactInitials,
    color: pm.color,
    company: pm.name,
    companyDesc: pm.description,
    tier: pm.tier,
    industry: pm.industry,
    companyPhone: pm.phone,
    companyWebsite: pm.website,
    address: pm.address,
  };
}

export function getAvailablePMCompanies(clients: ServiceDeskClient[]): PMCompany[] {
  const onboarded = new Set(clients.map((c) => c.pmCompanyId));
  return pmCompanies.filter((pm) => !onboarded.has(pm.id));
}

export function getClientTicketStats(
  tickets: Array<{ project: string; status: string }>,
  company: string,
) {
  const related = tickets.filter((t) => t.project === company);
  const activeTickets = related.filter(
    (t) => t.status === "Open" || t.status === "In Progress" || t.status === "Escalated",
  ).length;
  return { tickets: related.length, activeTickets };
}

export const seedServiceDeskClients: ServiceDeskClient[] = pmCompanies
  .filter((pm) =>
    [
      "pm-epss",
      "pm-eslse",
      "pm-ie",
      "pm-eotc",
      "pm-eramotl",
      "pm-mint",
      "pm-moti",
      "pm-csa",
      "pm-abay",
      "pm-mows",
    ].includes(pm.id),
  )
  .map((pm) => {
    const client = buildClientFromPM(pm);
    if (pm.id === "pm-mint") return { ...client, status: "Inactive" as const };
    return client;
  });
