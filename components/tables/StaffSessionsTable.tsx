"use client";

import React, { useEffect, useState, Key, useMemo } from "react";
import { ExamNames, StaffInfo } from "@/types/staff.type";
import toast, { Toaster } from "react-hot-toast";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Chip,
} from "@nextui-org/react";
import { fetchStaffSessions } from "@/utils/actions/staff.action";
import { sortDataByStartTime } from "@/helpers/date.helpers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment from "moment";
import { useStyles } from "@/helpers/styles.helpers";
import { AiOutlineClose } from "react-icons/ai";

interface StaffSessionsTableProps {
  staff: StaffInfo[];
  examNames: ExamNames[];
  examNamesError: string | null;
  staffError: string | null;
}

const attendanceOptions = ["N/A", "Present"];

function StaffSessionsTable({
  staff,
  examNames,
  examNamesError,
  staffError,
}: StaffSessionsTableProps) {
  const rowsPerPage = 10;
  const [selectedId, setSelectedId] = useState(
    examNames.length > 0
      ? examNames.map((examName) => examName.exam_name_id).join(",")
      : ""
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [filteredData, setFilteredData] = useState<any>([]);
  const [attendanceFilter, setAttendanceFilter] = useState(["Present"]);
  const [date, setDate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const classes = useStyles();

  useEffect(() => {
    if (staffError || examNamesError) {
      toast.error(staffError || examNamesError);
    }
  }, [examNamesError, staffError]);

  const isDisabled = () => selectedStaffId === null || selectedStaffId === "";

  const handleSubmit = async () => {
    try {
      setFilteredData([]);
      setIsLoading(true);
      const data: any = await fetchStaffSessions(selectedId, selectedStaffId);
      if (data.length > 0) {
        const sortedData = sortDataByStartTime([...data]);
        setFilteredData(sortedData);
      } else {
        setFilteredData([]);
        toast.error("No sessions found");
      }
    } catch (err) {
      toast.error("Error in fetching sessions");
    } finally {
      setIsLoading(false);
    }
  };

  function getAttendanceStatus(attendanceStatus: any) {
    if (attendanceStatus[0]?.attendance_status === "Present") {
      return "Present";
    } else {
      return "N/A";
    }
  }

  function calculateWeight(date: Date, start_time: string) {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 2;
    }

    let [hours, minutes] = start_time
      .replace(/AM|PM/i, "")
      .split(":")
      .map(Number);
    const period = start_time.toUpperCase().includes("PM") ? "PM" : "AM";

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    const timeIn24HourFormat = hours + minutes / 60;

    if (timeIn24HourFormat >= 17) {
      return 2;
    }

    if (timeIn24HourFormat >= 16 && timeIn24HourFormat < 17) {
      return 2;
    }

    return 1;
  }

  const flattenedItems = useMemo(() => {
    const items = filteredData?.flatMap((item: any) =>
      item.sessions.flatMap((session: any) =>
        session.assignments.map((assignment: any) => ({
          index: Math.random(),
          staff_venue: session.venue.name,
          staff_name: assignment.staff.staff_name,
          start_time: item.start_time,
          end_time: item.end_time,
          date: item.date,
          staff_id: assignment.staff.staff_id,
          staff_role: assignment.staff.staff_role,
          attendance: getAttendanceStatus(assignment.staff.attendances),
          exam_session_id: session.exam_session_id,
          weight: calculateWeight(item.date, item.start_time),
        }))
      )
    );

    const uniqueItems = Array.from(new Set(items.map(JSON.stringify))).map(
      (item) => JSON.parse(item as string)
    );

    let filteredItems = uniqueItems.filter((item) =>
      attendanceFilter.includes(item.attendance)
    );

    if (date) {
      const searchDate = new Date(date).toLocaleDateString("en-GB");

      filteredItems = filteredItems.filter((item: any) => {
        const itemDate = new Date(item.date).toLocaleDateString("en-GB");
        return itemDate === searchDate;
      });
    }

    filteredItems.sort((a: any, b: any) => {
      const nameComparison = a.staff_name.localeCompare(b.staff_name);
      if (nameComparison !== 0) return nameComparison;

      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;

      return 0;
    });

    return filteredItems;
  }, [filteredData, attendanceFilter, date]);

  const pages = Math.ceil(flattenedItems?.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return flattenedItems?.slice(start, end);
  }, [page, flattenedItems]);

  const handleDateChange = (date: moment.Moment | Date | null) => {
    if (date) {
      const newQuery: any = date.toISOString().split("T")[0];
      setDate(newQuery);
    }
  };

  const loadingState = isLoading ? "loading" : "idle";
  const isEmpty = flattenedItems.length === 0 && !isLoading;

  return (
    <div className="pb-4">
      <Toaster position="top-center" />

      <div className="flex w-full justify-center items-center">
        <Select
          label={selectedId !== "" && "Exam Name"}
          items={examNames}
          onChange={(e) => setSelectedId(e.target.value)}
          selectedKeys={selectedId.split(",").filter((id) => id !== "")}
          placeholder={
            examNames.length === 0 ? "No Exams Available" : "Select Exam"
          }
          className="my-2 w-full"
          disabled={examNames.length === 0}
          disallowEmptySelection
          selectionMode="multiple"
          isMultiline
        >
          {(examName) => (
            <SelectItem
              key={examName.exam_name_id}
              value={examName.exam_name_id}
            >
              {examName.exam_name}
            </SelectItem>
          )}
        </Select>
      </div>

      <div className="flex max-[900px]:flex-col sm:justify-between items-center">
        <div className="flex py-4 gap-4 justify-center items-center">
          <Autocomplete
            label="Staff Name"
            variant="bordered"
            defaultItems={staff}
            placeholder="Search Staff name"
            className="max-w-xs"
            selectedKey={selectedStaffId}
            onSelectionChange={(e: any) => {
              setSelectedStaffId(e);
              setFilteredData([]);
            }}
          >
            {(item: StaffInfo) => (
              <AutocompleteItem key={item.staff_id}>
                {item.staff_name}
              </AutocompleteItem>
            )}
          </Autocomplete>

          <Button
            disabled={isDisabled()}
            onClick={handleSubmit}
            color={`${isDisabled() ? "default" : "primary"}`}
          >
            Fetch
          </Button>
        </div>
        <div className="flex gap-4 pb-2 items-center">
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DemoContainer components={["DatePicker"]}>
              <div className="overflow-hidden py-2 relative">
                <DatePicker
                  label="Filter by Date"
                  value={date ? moment(new Date(date)) : null}
                  className={`${classes.datePicker} w-full md:w-[200px]`}
                  onChange={handleDateChange}
                />
                {date && (
                  <AiOutlineClose
                    className="cursor-pointer hover:opacity-50 absolute top-5 right-10"
                    onClick={() => setDate(null)}
                    size={22}
                    color="gray"
                  />
                )}
              </div>
            </DemoContainer>
          </LocalizationProvider>

          <Select
            label="Attendance Status"
            selectionMode="multiple"
            placeholder="Select attendance status"
            selectedKeys={attendanceFilter}
            className=" w-[180px]"
            onSelectionChange={(keys: any) =>
              setAttendanceFilter(Array.from(keys))
            }
            disallowEmptySelection
          >
            {attendanceOptions.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <Table
        // isStriped
        aria-label="Exams timetable"
        bottomContent={
          pages > 1 && (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          )
        }
        classNames={{
          table: isLoading || isEmpty ? "min-h-[400px]" : "",
        }}
      >
        <TableHeader>
          <TableColumn key="date">Date</TableColumn>
          <TableColumn key="start_time">Start Time</TableColumn>
          <TableColumn key="staff_venue">Venue</TableColumn>
          <TableColumn key="staff_name">Staff Name</TableColumn>
          <TableColumn key="staff_role">Staff Role</TableColumn>
          <TableColumn key="attendance">Attendance</TableColumn>
          {/* <TableColumn key="weight">Weight</TableColumn> */}
        </TableHeader>

        {isEmpty ? (
          <TableBody emptyContent={"No Data."}>{[]}</TableBody>
        ) : (
          <TableBody
            loadingContent={<Spinner />}
            loadingState={loadingState}
            items={items}
            aria-colspan={3}
          >
            {(item: any) => (
              <TableRow key={item.index}>
                {(columnKey) => (
                  <TableCell>
                    {columnKey === "date" ? (
                      <>
                        <div>
                          {new Date(item.date).toLocaleDateString("en-GB")}
                        </div>
                      </>
                    ) : columnKey === "attendance" ? (
                      <Chip
                        color={
                          item[columnKey] === "Present" ? "success" : "default"
                        }
                      >
                        {item[columnKey]}
                      </Chip>
                    ) : (
                      item[columnKey]
                    )}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        )}
      </Table>
    </div>
  );
}

export default StaffSessionsTable;
