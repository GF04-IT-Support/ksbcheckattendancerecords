import StaffSessionsTable from "@/components/tables/StaffSessionsTable";
import { getExamNames, getStaff } from "@/utils/actions/staff.action";

export default async function Home() {
  const staffResponse = await getStaff();
  const examNamesResponse = await getExamNames();

  const staff = Array.isArray(staffResponse) ? staffResponse : [];
  const examNames = Array.isArray(examNamesResponse) ? examNamesResponse : [];

  const staffErrorMessage = !Array.isArray(staffResponse)
    ? staffResponse.message
    : null;
  const examNamesErrorMessage = !Array.isArray(examNamesResponse)
    ? examNamesResponse.message
    : null;
  return (
    <>
      <StaffSessionsTable
        staff={staff}
        staffError={staffErrorMessage}
        examNamesError={examNamesErrorMessage}
        examNames={examNames}
      />
    </>
  );
}
