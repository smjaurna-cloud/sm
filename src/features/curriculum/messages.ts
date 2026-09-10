import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Navigation & General
  "curriculum.nav": { th: "จัดการหลักสูตร", en: "Curricula" },
  "curriculum.title": { th: "หลักสูตรการศึกษา", en: "Academic Curricula" },
  "curriculum.subtitle": { th: "จัดการข้อมูลหลักสูตรปริญญาตรี ปริญญาโท ปริญญาเอก และประกาศนียบัตร", en: "Manage Bachelor, Master, Doctoral, and Certificate degree programs" },
  "curriculum.create": { th: "เพิ่มหลักสูตรใหม่", en: "Add New Curriculum" },
  "curriculum.edit": { th: "แก้ไขข้อมูลหลักสูตร", en: "Edit Curriculum" },
  "curriculum.delete": { th: "ลบหลักสูตร", en: "Delete Curriculum" },
  "curriculum.deleteConfirm": { th: "คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตรนี้?", en: "Are you sure you want to delete this curriculum?" },
  "curriculum.save": { th: "บันทึก", en: "Save" },
  "curriculum.cancel": { th: "ยกเลิก", en: "Cancel" },
  "curriculum.empty": { th: "ยังไม่มีข้อมูลหลักสูตรการศึกษา", en: "No academic programs found" },

  // Fields
  "curriculum.code": { th: "รหัสหลักสูตร", en: "Curriculum Code" },
  "curriculum.nameTh": { th: "ชื่อหลักสูตร (ไทย)", en: "Curriculum Name (Thai)" },
  "curriculum.nameEn": { th: "ชื่อหลักสูตร (อังกฤษ)", en: "Curriculum Name (English)" },
  "curriculum.degreeTh": { th: "ชื่อปริญญา (ไทย)", en: "Degree Title (Thai)" },
  "curriculum.degreeEn": { th: "ชื่อปริญญา (อังกฤษ)", en: "Degree Title (English)" },
  "curriculum.level": { th: "ระดับการศึกษา", en: "Degree Level" },
  "curriculum.department": { th: "ภาควิชา / ผู้รับผิดชอบ", en: "Department" },
  "curriculum.durationYears": { th: "ระยะเวลาการศึกษา (ปี)", en: "Duration (Years)" },
  "curriculum.totalCredits": { th: "จำนวนหน่วยกิตรวม", en: "Total Credits" },
  "curriculum.tuitionFee": { th: "ค่าธรรมเนียมการศึกษา", en: "Tuition Fee" },
  "curriculum.language": { th: "ภาษาที่ใช้ในการสอน", en: "Language of Instruction" },
  "curriculum.descriptionTh": { th: "รายละเอียดหลักสูตร (ไทย)", en: "Description (Thai)" },
  "curriculum.descriptionEn": { th: "รายละเอียดหลักสูตร (อังกฤษ)", en: "Description (English)" },
  "curriculum.careerOpportunities": { th: "แนวทางการประกอบอาชีพ (คั่นด้วยจุลภาค)", en: "Career Opportunities (comma-separated)" },
  "curriculum.studyPlan": { th: "โครงสร้างแผนการศึกษา", en: "Study Plan Structure" },
  "curriculum.coverImage": { th: "ลิงก์รูปภาพปก", en: "Cover Image URL" },
  "curriculum.brochureUrl": { th: "ลิงก์ดาวน์โหลดแผ่นพับ / มคอ.2", en: "Brochure / Curriculum Spec URL" },
  "curriculum.isActive": { th: "สถานะการเปิดสอน", en: "Active Status" },
  "curriculum.orderSeq": { th: "ลำดับการแสดงผล", en: "Display Order" },

  // Degree Levels
  "curriculum.level.ALL": { th: "ทุกระดับการศึกษา", en: "All Levels" },
  "curriculum.level.BACHELOR": { th: "ระดับปริญญาตรี", en: "Undergraduate (Bachelor's)" },
  "curriculum.level.MASTER": { th: "ระดับปริญญาโท", en: "Graduate (Master's)" },
  "curriculum.level.DOCTORAL": { th: "ระดับปริญญาเอก", en: "Doctoral (Ph.D.)" },
  "curriculum.level.CERTIFICATE": { th: "หลักสูตรระยะสั้น / สัมฤทธิบัตร", en: "Certificate / Lifelong Learning" },

  // Status
  "curriculum.status.active": { th: "เปิดรับสมัคร / เปิดสอน", en: "Active / Enrolling" },
  "curriculum.status.inactive": { th: "ปิดรับสมัครชั่วคราว", en: "Inactive / Suspended" },

  // Toast notifications
  "curriculum.createSuccess": { th: "สร้างข้อมูลหลักสูตรเรียบร้อยแล้ว", en: "Curriculum created successfully" },
  "curriculum.updateSuccess": { th: "บันทึกการแก้ไขหลักสูตรเรียบร้อยแล้ว", en: "Curriculum updated successfully" },
  "curriculum.deleteSuccess": { th: "ลบข้อมูลหลักสูตรเรียบร้อยแล้ว", en: "Curriculum deleted successfully" },

  // Permissions & Roles
  "roles.module.curriculum": { th: "โมดูลจัดการหลักสูตร", en: "Curriculum Management Module" },
  "perm.curriculum:read": { th: "ดูข้อมูลหลักสูตรในระบบ", en: "View curriculum programs" },
  "perm.curriculum:manage": { th: "จัดการหลักสูตร (เพิ่ม/แก้ไข/ลบ)", en: "Manage curriculum programs" },

  // Public Portal UI
  "portal.searchCurriculum": { th: "ค้นหาหลักสูตร เช่น วิทยาการคอมพิวเตอร์, AI...", en: "Search curricula by name, degree, or keyword..." },
  "portal.viewCurriculum": { th: "ดูรายละเอียดหลักสูตร", en: "View Curriculum Details" },
  "portal.backToCurriculums": { th: "กลับไปหน้ารวมหลักสูตร", en: "Back to Curricula Catalog" },
  "portal.downloadBrochure": { th: "ดาวน์โหลดเล่มหลักสูตร (PDF)", en: "Download Curriculum PDF" },
  "portal.keyHighlights": { th: "ข้อมูลสรุปสำคัญของหลักสูตร", en: "Program Key Highlights" },
  "portal.yearsFormat": { th: "ปี", en: "Years" },
  "portal.creditsFormat": { th: "หน่วยกิต", en: "Credits" },
  "portal.careerOpportunitiesTitle": { th: "อาชีพและสายงานที่รองรับ", en: "Career Opportunities & Job Roles" },
  "portal.curriculumStructureTitle": { th: "โครงสร้างหมวดวิชาในหลักสูตร", en: "Curriculum Course Structure" },
};
