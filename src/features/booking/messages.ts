import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Navigation & General
  "booking.nav": { th: "จัดการการจองห้องและยานพาหนะ", en: "Facility & Vehicle Bookings" },
  "booking.title": { th: "ระบบจองห้องและยานพาหนะ", en: "Facility & Vehicle Booking System" },
  "booking.subtitle": { th: "บริการจองห้องประชุม ห้องปฏิบัติการคอมพิวเตอร์ และยานพาหนะส่วนกลางของคณะ", en: "Reserve meeting rooms, computing labs, and faculty vehicles" },
  "booking.create": { th: "ขอใช้บริการ / จอง", en: "New Booking Request" },
  "booking.edit": { th: "แก้ไขข้อมูลการจอง", en: "Edit Booking" },
  "booking.delete": { th: "ลบการจอง", en: "Delete Booking" },
  "booking.approve": { th: "อนุมัติการจอง", en: "Approve Booking" },
  "booking.reject": { th: "ปฏิเสธการจอง", en: "Reject Booking" },
  "booking.cancel": { th: "ยกเลิกคำขอจอง", en: "Cancel Booking" },
  "booking.empty": { th: "ไม่มีรายการจองในช่วงเวลานี้", en: "No bookings found" },

  // Fields
  "booking.bookingNumber": { th: "รหัสใบจอง", en: "Booking No." },
  "booking.resource": { th: "ห้อง / ยานพาหนะ", en: "Resource" },
  "booking.requester": { th: "ผู้ขอใช้บริการ", en: "Requester" },
  "booking.purpose": { th: "วัตถุประสงค์การใช้งาน / หัวข้อกิจกรรม", en: "Purpose / Activity Title" },
  "booking.startAt": { th: "วัน-เวลาเริ่มต้น", en: "Start Time" },
  "booking.endAt": { th: "วัน-เวลาสิ้นสุด", en: "End Time" },
  "booking.attendeesCount": { th: "จำนวนผู้เข้าร่วม (คน)", en: "Attendees" },
  "booking.contactPhone": { th: "เบอร์โทรศัพท์ติดต่อ", en: "Contact Phone" },
  "booking.notes": { th: "หมายเหตุ / สิ่งที่ต้องการเพิ่มเติม", en: "Additional Notes / Setup" },
  "booking.rejectionReason": { th: "เหตุผลที่ไม่อนุมัติ", en: "Rejection Reason" },
  "booking.status": { th: "สถานะคำขอ", en: "Status" },
  "booking.capacity": { th: "ความจุ / จำนวนที่นั่ง", en: "Capacity" },
  "booking.location": { th: "สถานที่ตั้ง / จุดจอดรถ", en: "Location" },
  "booking.facilities": { th: "สิ่งอำนวยความสะดวก", en: "Facilities & Equipment" },

  // Types
  "booking.type.ALL": { th: "ทรัพยากรทั้งหมด", en: "All Resources" },
  "booking.type.ROOM": { th: "ห้องประชุม / ห้องเรียน", en: "Meeting Rooms & Labs" },
  "booking.type.VEHICLE": { th: "ยานพาหนะส่วนกลาง", en: "Faculty Vehicles" },
  "booking.type.EQUIPMENT": { th: "อุปกรณ์โสตทัศน์", en: "Equipment" },

  // Statuses
  "booking.status.PENDING": { th: "รออนุมัติ", en: "Pending Review" },
  "booking.status.APPROVED": { th: "อนุมัติแล้ว", en: "Approved" },
  "booking.status.REJECTED": { th: "ไม่อนุมัติ", en: "Rejected" },
  "booking.status.CANCELLED": { th: "ยกเลิกแล้ว", en: "Cancelled" },
  "booking.status.COMPLETED": { th: "เสร็จสิ้น", en: "Completed" },

  // Toast notifications & Alerts
  "booking.createSuccess": { th: "ส่งคำขอจองเรียบร้อยแล้ว", en: "Booking request submitted successfully" },
  "booking.approveSuccess": { th: "อนุมัติคำขอจองเรียบร้อยแล้ว", en: "Booking request approved" },
  "booking.rejectSuccess": { th: "ปฏิเสธคำขอจองแล้ว", en: "Booking request rejected" },
  "booking.cancelSuccess": { th: "ยกเลิกคำขอจองเรียบร้อยแล้ว", en: "Booking cancelled successfully" },
  "booking.overlapError": { th: "ช่วงวันและเวลาดังกล่าวมีการจองใช้งานแล้ว กรุณาเลือกช่วงเวลาอื่น", en: "The selected time slot is already booked. Please choose another time." },
  "booking.invalidTimeError": { th: "เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด", en: "Start time must be before end time" },

  // Permissions & Roles
  "roles.module.booking": { th: "โมดูลจองห้องและยานพาหนะ", en: "Facility & Vehicle Booking Module" },
  "perm.booking:read": { th: "ดูรายการจองและตารางเวลา", en: "View booking schedules" },
  "perm.booking:create": { th: "ส่งคำขอจองห้องและยานพาหนะ", en: "Create booking requests" },
  "perm.booking:manage": { th: "อนุมัติ/ปฏิเสธ และจัดการห้อง/ยานพาหนะ", en: "Manage resources and bookings" },

  // Public Portal UI
  "portal.booking": { th: "จองห้องและยานพาหนะ", en: "Booking Services" },
  "portal.bookNow": { th: "ส่งคำขอจอง", en: "Book This Resource" },
  "portal.viewSchedule": { th: "ดูตารางการใช้งาน", en: "View Schedule" },
  "portal.scheduleToday": { th: "ตารางการจองใช้งานวันนี้", en: "Today's Schedule" },
  "portal.noBookingsToday": { th: "ไม่มีรายการจองใช้งานในวันนี้ (ว่างพร้อมใช้งาน)", en: "No bookings for today (Available)" },
  "portal.loginToBook": { th: "กรุณาเข้าสู่ระบบเพื่อทำการจอง", en: "Please sign in to make a booking" },
  "portal.capacityPersons": { th: "ที่นั่ง", en: "seats" },
};
