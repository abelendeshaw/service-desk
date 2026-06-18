/** Mock Selamnew Core integration — fiscal year, departments, org structure */

export type FiscalYear = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

export type Department = {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
};

export type OrgUnit = {
  id: string;
  name: string;
  type: "company" | "division" | "department" | "team";
  parentId: string | null;
  children?: OrgUnit[];
};

export const fiscalYears: FiscalYear[] = [
  { id: "fy-2024", label: "FY 2024", startDate: "2024-07-01", endDate: "2025-06-30", isCurrent: false },
  { id: "fy-2025", label: "FY 2025", startDate: "2025-07-01", endDate: "2026-06-30", isCurrent: false },
  { id: "fy-2026", label: "FY 2026", startDate: "2026-07-01", endDate: "2027-06-30", isCurrent: true },
];

export const departments: Department[] = [
  { id: "dept-it", name: "Information Technology", code: "IT", parentId: null },
  { id: "dept-noc", name: "Network Operations Center", code: "NOC", parentId: "dept-it" },
  { id: "dept-fs", name: "Field Services", code: "FS", parentId: "dept-it" },
  { id: "dept-cs", name: "Client Success", code: "CS", parentId: null },
  { id: "dept-hr", name: "Human Resources", code: "HR", parentId: null },
  { id: "dept-fin", name: "Finance", code: "FIN", parentId: null },
];

export const orgStructure: OrgUnit[] = [
  {
    id: "org-ie",
    name: "IE Networks",
    type: "company",
    parentId: null,
    children: [
      {
        id: "org-ops",
        name: "Operations",
        type: "division",
        parentId: "org-ie",
        children: [
          { id: "org-noc", name: "NOC", type: "team", parentId: "org-ops" },
          { id: "org-fs", name: "Field Services", type: "team", parentId: "org-ops" },
        ],
      },
      {
        id: "org-cs",
        name: "Client Services",
        type: "division",
        parentId: "org-ie",
        children: [
          { id: "org-sd", name: "Service Desk", type: "team", parentId: "org-cs" },
        ],
      },
    ],
  },
];

export function getCurrentFiscalYear(): FiscalYear {
  return fiscalYears.find((fy) => fy.isCurrent) ?? fiscalYears[fiscalYears.length - 1];
}

export async function fetchSelamnewCoreData() {
  return {
    fiscalYears,
    departments,
    orgStructure,
    currentFiscalYear: getCurrentFiscalYear(),
  };
}
