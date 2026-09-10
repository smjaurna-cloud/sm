import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Navigation & General
  "staff.nav": { th: "จัดการบุคลากร", en: "Staff Directory" },
  "staff.title": { th: "ทำเนียบคณาจารย์และบุคลากร", en: "Faculty & Staff Directory" },
  "staff.subtitle": { th: "จัดการรายชื่ออาจารย์ นักวิจัย และเจ้าหน้าที่คณะ", en: "Manage faculty members, researchers, and staff" },
  "staff.executiveBoard": { th: "คณะผู้บริหาร", en: "Executive Board" },
  "staff.academicStaff": { th: "คณาจารย์ประจำภาควิชา", en: "Academic Faculty" },
  "staff.supportStaff": { th: "บุคลากรสายสนับสนุน", en: "Support Staff" },
  "staff.create": { th: "เพิ่มบุคลากร", en: "Add Staff Member" },
  "staff.edit": { th: "แก้ไขข้อมูลบุคลากร", en: "Edit Staff Member" },
  "staff.delete": { th: "ลบข้อมูลบุคลากร", en: "Delete Staff Member" },
  "staff.deleteConfirm": { th: "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลบุคลากรท่านนี้?", en: "Are you sure you want to delete this staff member?" },
  "staff.save": { th: "บันทึก", en: "Save" },
  "staff.cancel": { th: "ยกเลิก", en: "Cancel" },

  // Fields
  "staff.nameTh": { th: "ชื่อ-นามสกุล (ไทย)", en: "Name (Thai)" },
  "staff.nameEn": { th: "ชื่อ-นามสกุล (อังกฤษ)", en: "Name (English)" },
  "staff.titleTh": { th: "คำนำหน้า (ไทย)", en: "Title (Thai)" },
  "staff.titleEn": { th: "คำนำหน้า (อังกฤษ)", en: "Title (English)" },
  "staff.firstNameTh": { th: "ชื่อ (ไทย)", en: "First Name (Thai)" },
  "staff.lastNameTh": { th: "นามสกุล (ไทย)", en: "Last Name (Thai)" },
  "staff.firstNameEn": { th: "ชื่อ (อังกฤษ)", en: "First Name (English)" },
  "staff.lastNameEn": { th: "นามสกุล (อังกฤษ)", en: "Last Name (English)" },
  "staff.academicPosition": { th: "ตำแหน่งทางวิชาการ", en: "Academic Position" },
  "staff.managementPositionTh": { th: "ตำแหน่งบริหาร (ไทย)", en: "Management Position (Thai)" },
  "staff.managementPositionEn": { th: "ตำแหน่งบริหาร (อังกฤษ)", en: "Management Position (English)" },
  "staff.department": { th: "ภาควิชา / สังกัด", en: "Department" },
  "staff.email": { th: "อีเมล", en: "Email" },
  "staff.phoneExt": { th: "เบอร์โทรศัพท์ภายใน", en: "Phone Ext." },
  "staff.roomNumber": { th: "ห้องทำงาน", en: "Office / Room" },
  "staff.avatarUrl": { th: "ลิงก์รูปถ่าย", en: "Photo URL" },
  "staff.education": { th: "ประวัติการศึกษา", en: "Education" },
  "staff.expertise": { th: "สาขาความเชี่ยวชาญ (คั่นด้วยจุลภาค)", en: "Expertise (comma-separated)" },
  "staff.isExecutive": { th: "คณะผู้บริหาร (แสดงในผังผู้บริหาร)", en: "Executive Board Member" },
  "staff.isActive": { th: "สถานะการปฏิบัติงาน", en: "Active Status" },
  "staff.status.active": { th: "ปฏิบัติงานปกติ", en: "Active" },
  "staff.status.inactive": { th: "พ้นสภาพ / ลาศึกษาต่อ", en: "Inactive / On Leave" },
  "staff.orderSeq": { th: "ลำดับการแสดงผล", en: "Order Sequence" },
  "staff.empty": { th: "ไม่พบข้อมูลบุคลากร", en: "No staff members found" },

  // Toast notifications
  "staff.createSuccess": { th: "เพิ่มข้อมูลบุคลากรเรียบร้อยแล้ว", en: "Staff member created successfully" },
  "staff.updateSuccess": { th: "บันทึกการแก้ไขเรียบร้อยแล้ว", en: "Staff member updated successfully" },
  "staff.deleteSuccess": { th: "ลบข้อมูลบุคลากรเรียบร้อยแล้ว", en: "Staff member deleted successfully" },

  // Academic Positions
  "staff.pos.PROFESSOR": { th: "ศาสตราจารย์", en: "Professor" },
  "staff.pos.ASSOCIATE_PROFESSOR": { th: "รองศาสตราจารย์", en: "Associate Professor" },
  "staff.pos.ASSISTANT_PROFESSOR": { th: "ผู้ช่วยศาสตราจารย์", en: "Assistant Professor" },
  "staff.pos.LECTURER": { th: "อาจารย์", en: "Lecturer" },
  "staff.pos.RESEARCHER": { th: "นักวิจัย", en: "Researcher" },
  "staff.pos.OFFICER": { th: "เจ้าหน้าที่สายสนับสนุน", en: "Officer / Staff" },
  "staff.pos.OTHER": { th: "อื่น ๆ", en: "Other" },

  // Permissions
  "roles.module.staff": { th: "โมดูลทำเนียบบุคลากร", en: "Staff Directory Module" },
  "perm.staff:read": { th: "ดูข้อมูลบุคลากรในระบบ", en: "View staff profiles" },
  "perm.staff:manage": { th: "จัดการข้อมูลบุคลากร (เพิ่ม/แก้ไข/ลบ)", en: "Manage staff profiles" },
  "perm.staff:profile:update_self": { th: "แก้ไขประวัติตนเอง", en: "Update own profile" },

  // Public Portal UI
  "portal.allDepartments": { th: "ทุกภาควิชา / หน่วยงาน", en: "All Departments" },
  "portal.searchStaff": { th: "ค้นหาชื่ออาจารย์ หรือสาขาความเชี่ยวชาญ...", en: "Search by name or expertise..." },
  "portal.viewProfile": { th: "ดูประวัติและผลงาน", en: "View Profile" },
  "portal.backToStaff": { th: "กลับไปหน้าทำเนียบบุคลากร", en: "Back to Directory" },
  "portal.contactInfo": { th: "ข้อมูลติดต่อ", en: "Contact Information" },
  "portal.educationHistory": { th: "ประวัติการศึกษาและคุณวุฒิ", en: "Education & Credentials" },
  "portal.expertiseAreas": { th: "ความเชี่ยวชาญและงานวิจัยที่สนใจ", en: "Areas of Expertise" },
};
