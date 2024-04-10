"use server";

import prisma from "@/utils/prisma";

export async function getExamNames() {
  try {
    const examNames = await prisma.examName.findMany({
      where: {
        selected: true,
      },
      orderBy: {
        order: "desc",
      },
    });

    return examNames;
  } catch (err) {
    return { message: "Error in fetching exam names" };
  }
}

export async function getStaff() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: {
        staff_name: "asc",
      },
    });
    return staff;
  } catch (err) {
    return { message: "Error in fetching staff" };
  }
}

export async function fetchStaffSessions(examNameId: string, staffId: string) {
  try {
    const examNameIds = examNameId.split(",").filter((id) => id.trim() !== "");
    const exams = await prisma.exam.findMany({
      where: {
        exam_name_id: {
          in: examNameIds,
        },
      },
      include: {
        exam_name: true,
        sessions: {
          include: {
            venue: true,
            assignments: {
              where: {
                staff_id: staffId,
              },
              include: {
                staff: {
                  include: {
                    attendances: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const filteredExams = exams
      .map((exam) => ({
        ...exam,
        sessions: exam.sessions
          .map((session) => ({
            ...session,
            assignments: session.assignments.map((assignment) => ({
              ...assignment,
              staff: {
                ...assignment.staff,
                attendances: assignment.staff.attendances.filter(
                  (attendance) =>
                    attendance.exam_session_id === session.exam_session_id
                ),
              },
            })),
          }))
          .filter((session) => session.assignments.length > 0),
      }))
      .filter((exam) => exam.sessions.length > 0);

    const sessions = filteredExams.map((exam) => ({
      ...exam,
      sessions: exam.sessions.filter((session) => {
        if (!session.assignments || session.assignments.length === 0) {
          return false;
        }

        const examVenues = exam.venue
          ? exam.venue.split(",").map((venue) => venue.trim())
          : [];
        return session.assignments.some(() => {
          const assignmentVenue = session.venue.name;
          return examVenues.includes(assignmentVenue);
        });
      }),
    }));

    return sessions;
  } catch (err) {
    return { message: "Error in fetching staff sessions" };
  }
}
