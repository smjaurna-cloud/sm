import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // Seed News Categories
  const catGeneral = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "general" } },
    update: {},
    create: { tenantId: core.tenantId, slug: "general", nameTh: "ข่าวประชาสัมพันธ์ทั่วไป", nameEn: "General Announcements", orderSeq: 1 },
  });
  const catAcademic = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "academic" } },
    update: {},
    create: { tenantId: core.tenantId, slug: "academic", nameTh: "ข่าววิชาการและการศึกษา", nameEn: "Academic & Education", orderSeq: 2 },
  });
  const catActivities = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "activities" } },
    update: {},
    create: { tenantId: core.tenantId, slug: "activities", nameTh: "กิจกรรมและผลงานนักศึกษา", nameEn: "Activities & Student Life", orderSeq: 3 },
  });
  await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "research" } },
    update: {},
    create: { tenantId: core.tenantId, slug: "research", nameTh: "การวิจัยและนวัตกรรม", nameEn: "Research & Innovation", orderSeq: 4 },
  });

  // Seed News Articles
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@app.local" } });
  const sampleArticles = [
    {
      slug: "admission-round-portfolio-2027",
      categoryId: catAcademic.id,
      titleTh: "เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2570 รอบ Portfolio",
      titleEn: "Admissions Open for Academic Year 2027 (Portfolio Round)",
      summaryTh: "เปิดรับสมัครผู้สำเร็จการศึกษาชั้น ม.6 เข้าศึกษาต่อในระดับปริญญาตรี 5 สาขาวิชาชีพแห่งอนาคต",
      summaryEn: "Undergraduate applications now open for high school graduates across 5 future-ready digital disciplines.",
      contentTh: "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มีความยินดีที่จะประกาศเปิดรับสมัครบุคคลเข้าศึกษาต่อในระดับปริญญาตรี ประจำปีการศึกษา 2570 รอบที่ 1 แฟ้มสะสมผลงาน (Portfolio)\n\nหลักสูตรที่เปิดรับสมัครประกอบด้วย:\n1. สาขาวิชาวิทยาการคอมพิวเตอร์และปัญญาประดิษฐ์ (CS & AI)\n2. สาขาวิชาเทคโนโลยีสารสนเทศและการพัฒนาคลาวด์ (IT & Cloud Computing)\n3. สาขาวิชาวิศวกรรมซอฟต์แวร์ระดับองค์กร (Enterprise Software Engineering)\n4. สาขาวิชาความมั่นคงปลอดภัยไซเบอร์ (Cybersecurity)\n5. สาขาวิชานวัตกรรมสื่อดิจิทัลและเกม (Digital Media & Game Innovation)\n\nผู้สนใจสามารถศึกษารายละเอียดและยื่นใบสมัครออนไลน์ได้ตั้งแต่วันนี้ จนถึงวันที่ 30 พฤศจิกายนนี้",
      contentEn: "The Faculty of Information Technology and Digital Innovation is pleased to announce direct undergraduate admissions for Academic Year 2027 (Round 1: Portfolio).\n\nPrograms open for application:\n1. Computer Science & Artificial Intelligence\n2. Information Technology & Cloud Computing\n3. Enterprise Software Engineering\n4. Cybersecurity & Digital Forensics\n5. Digital Media & Game Innovation\n\nApplicants can submit their portfolios online starting today through November 30.",
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED" as const,
      isPinned: true,
      targetAudience: "ALL" as const,
      publishedAt: new Date(),
    },
    {
      slug: "faculty-wins-national-ai-championship",
      categoryId: catActivities.id,
      titleTh: "ทีมนักศึกษาคณะฯ คว้าแชมป์การแข่งขันประกวดนวัตกรรม AI Hackathon ระดับประเทศ",
      titleEn: "Student Team Wins 1st Place at National AI Hackathon Competition",
      summaryTh: "ขอแสดงความยินดีกับทีม 'NeuralVibe' ที่คว้ารางวัลชนะเลิศอันดับ 1 พร้อมเงินรางวัล 100,000 บาท",
      summaryEn: "Congratulations to team 'NeuralVibe' for securing the champion title and 100,000 THB grand prize.",
      contentTh: "เมื่อวันที่ 5 กันยายนที่ผ่านมา ทีมนักศึกษาตัวแทนคณะฯ ในชื่อทีม 'NeuralVibe' ประกอบด้วยนักศึกษาชั้นปีที่ 3 และ 4 ได้เข้าร่วมการแข่งขันพัฒนาซอฟต์แวร์ปัญญาประดิษฐ์ Thailand AI Innovation Challenge 2026\n\nทีมของคณะฯ ได้พัฒนาผลงานระบบตรวจจับและแจ้งเตือนภัยน้ำท่วมล่วงหน้าด้วยเซนเซอร์ IoT ร่วมกับโมเดลการเรียนรู้เชิงลึก (Deep Learning) ซึ่งสามารถทำงานได้อย่างแม่นยำสูง และสามารถนำไปประยุกต์ใช้ในการแก้ปัญหาชุมชนได้จริง จนได้รับรางวัลชนะเลิศอันดับหนึ่งจากการแข่งขัน",
      contentEn: "On September 5, our student representative team 'NeuralVibe' competed in the Thailand AI Innovation Challenge 2026.\n\nThe team developed an intelligent early flood warning system combining IoT sensor telemetry with deep learning predictive models, achieving outstanding accuracy and real-world community impact to win the first place trophy.",
      coverImageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED" as const,
      isPinned: true,
      targetAudience: "PUBLIC" as const,
      publishedAt: new Date(Date.now() - 86400000),
    },
    {
      slug: "orientation-schedule-semester-1",
      categoryId: catGeneral.id,
      titleTh: "ประกาศกำหนดการปฐมนิเทศนักศึกษาใหม่ และการเปิดภาคการศึกษาที่ 1/2569",
      titleEn: "New Student Orientation Schedule & Semester 1/2026 Opening",
      summaryTh: "ขอเชิญนักศึกษาใหม่ทุกคนเข้าร่วมกิจกรรมปฐมนิเทศ ณ หอประชุมใหญ่คณะ และระบบถ่ายทอดสด",
      summaryEn: "All freshmen are cordially invited to the Orientation Ceremony at the Main Auditorium and live stream.",
      contentTh: "ฝ่ายกิจการนักศึกษา ขอแจ้งกำหนดการสำคัญสำหรับนักศึกษาใหม่ทุกชั้นปี ดังต่อไปนี้:\n- 15 กันยายน: กิจกรรมปฐมนิเทศและต้อนรับน้องใหม่\n- 18 กันยายน: การทดสอบวัดระดับภาษาอังกฤษและทักษะดิจิทัล\n- 22 กันยายน: เปิดการเรียนการสอนสัปดาห์แรก\n\nขอให้นักศึกษาแต่งกายด้วยชุดนักศึกษาถูกระเบียบและนำบัตรประจำตัวประชาชนมาแสดงเพื่อลงทะเบียน",
      contentEn: "The Student Affairs Office announces the key dates for incoming freshmen:\n- Sept 15: Freshman Orientation & Welcome Day\n- Sept 18: English Placement & Digital Proficiency Assessment\n- Sept 22: First Day of Classes\n\nPlease arrive in formal student uniform with your national ID card for verification.",
      coverImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED" as const,
      isPinned: false,
      targetAudience: "ALL" as const,
      publishedAt: new Date(Date.now() - 172800000),
    },
  ];

  for (const art of sampleArticles) {
    await prisma.newsArticle.upsert({
      where: { tenantId_slug: { tenantId: core.tenantId, slug: art.slug } },
      update: {},
      create: {
        tenantId: core.tenantId,
        authorId: adminUser?.id ?? null,
        ...art,
      },
    });
  }

  // Seed Departments
  const deptCS = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "CS" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "CS",
      nameTh: "ภาควิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Department of Computer Science",
      type: "ACADEMIC",
      orderSeq: 1,
    },
  });

  const deptIT = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "IT" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "IT",
      nameTh: "ภาควิชาเทคโนโลยีสารสนเทศ",
      nameEn: "Department of Information Technology",
      type: "ACADEMIC",
      orderSeq: 2,
    },
  });

  await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "DEAN_OFFICE" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "DEAN_OFFICE",
      nameTh: "สำนักงานคณบดี",
      nameEn: "Dean's Office",
      type: "ADMINISTRATIVE",
      orderSeq: 3,
    },
  });

  // Seed Staff Profiles
  const sampleStaff = [
    {
      departmentId: deptCS.id,
      titleTh: "ศ.ดร.",
      titleEn: "Prof. Dr.",
      firstNameTh: "สมชาย",
      lastNameTh: "ปัญญาวิมล",
      firstNameEn: "Somchai",
      lastNameEn: "Panyawimon",
      academicPosition: "PROFESSOR" as const,
      managementPositionTh: "คณบดี",
      managementPositionEn: "Dean of the Faculty",
      email: "dean@faculty.ac.th",
      phoneExt: "101",
      roomNumber: "IT-801",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      isExecutive: true,
      orderSeq: 1,
      expertise: ["Artificial Intelligence", "High Performance Computing", "Distributed Systems"],
      educationHistory: [
        { degree: "Ph.D. in Computer Science", field: "Artificial Intelligence", institution: "Stanford University", year: "2548" },
        { degree: "วศ.ม. วิศวกรรมคอมพิวเตอร์", field: "วิศวกรรมคอมพิวเตอร์", institution: "จุฬาลงกรณ์มหาวิทยาลัย", year: "2543" },
      ],
    },
    {
      departmentId: deptIT.id,
      titleTh: "รศ.ดร.",
      titleEn: "Assoc. Prof. Dr.",
      firstNameTh: "กิตติพงษ์",
      lastNameTh: "สิทธิเวช",
      firstNameEn: "Kittipong",
      lastNameEn: "Sittiwej",
      academicPosition: "ASSOCIATE_PROFESSOR" as const,
      managementPositionTh: "รองคณบดีฝ่ายวิชาการและวิจัย",
      managementPositionEn: "Associate Dean for Academic Affairs & Research",
      email: "kittipong@faculty.ac.th",
      phoneExt: "102",
      roomNumber: "IT-802",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      isExecutive: true,
      orderSeq: 2,
      expertise: ["Cloud Native Architecture", "Microservices", "Software Engineering"],
      educationHistory: [
        { degree: "Ph.D. in Software Engineering", field: "Software Systems", institution: "Carnegie Mellon University", year: "2552" },
      ],
    },
    {
      departmentId: deptCS.id,
      titleTh: "ผศ.ดร.",
      titleEn: "Asst. Prof. Dr.",
      firstNameTh: "นภัสสร",
      lastNameTh: "เจริญสุข",
      firstNameEn: "Napassorn",
      lastNameEn: "Charoensuk",
      academicPosition: "ASSISTANT_PROFESSOR" as const,
      managementPositionTh: "หัวหน้าภาควิชาวิทยาการคอมพิวเตอร์",
      managementPositionEn: "Head of Computer Science Department",
      email: "napassorn@faculty.ac.th",
      phoneExt: "201",
      roomNumber: "IT-501",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      isExecutive: true,
      orderSeq: 3,
      expertise: ["Cybersecurity", "Blockchain", "Information Security"],
      educationHistory: [
        { degree: "Ph.D. in Information Security", field: "Cryptography", institution: "Tokyo Institute of Technology", year: "2558" },
      ],
    },
    {
      departmentId: deptCS.id,
      titleTh: "อ.ดร.",
      titleEn: "Dr.",
      firstNameTh: "วรวิทย์",
      lastNameTh: "ตั้งมั่น",
      firstNameEn: "Worawit",
      lastNameEn: "Tangman",
      academicPosition: "LECTURER" as const,
      email: "worawit@faculty.ac.th",
      phoneExt: "205",
      roomNumber: "IT-510",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      isExecutive: false,
      orderSeq: 10,
      expertise: ["Machine Learning", "Natural Language Processing", "Large Language Models"],
      educationHistory: [
        { degree: "Ph.D. in Computer Science", field: "Data Science", institution: "National University of Singapore", year: "2564" },
      ],
    },
    {
      departmentId: deptIT.id,
      titleTh: "ผศ.",
      titleEn: "Asst. Prof.",
      firstNameTh: "ปิยะวรรณ",
      lastNameTh: "สุวรรณรัตน์",
      firstNameEn: "Piyawan",
      lastNameEn: "Suwannarat",
      academicPosition: "ASSISTANT_PROFESSOR" as const,
      email: "piyawan@faculty.ac.th",
      phoneExt: "302",
      roomNumber: "IT-602",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
      isExecutive: false,
      orderSeq: 11,
      expertise: ["UX/UI Design", "Human-Computer Interaction", "Web Engineering"],
      educationHistory: [
        { degree: "M.S. in Information Technology", field: "Human-Computer Interaction", institution: "University of Washington", year: "2556" },
      ],
    },
  ];

  for (const st of sampleStaff) {
    const existing = await prisma.staffProfile.findFirst({
      where: {
        tenantId: core.tenantId,
        firstNameTh: st.firstNameTh,
        lastNameTh: st.lastNameTh,
      },
    });

    if (!existing) {
      await prisma.staffProfile.create({
        data: {
          tenantId: core.tenantId,
          ...st,
        },
      });
    }
  }

  // -------------------------------------------------------------
  // SEED: CURRICULUMS (หลักสูตรการศึกษา)
  // -------------------------------------------------------------
  const sampleCurriculums = [
    {
      departmentId: deptCS.id,
      code: "CS-BSC-2565",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Bachelor of Science Program in Computer Science",
      degreeTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์) / วท.บ. (วิทยาการคอมพิวเตอร์)",
      degreeEn: "Bachelor of Science (Computer Science) / B.S. (Computer Science)",
      level: "BACHELOR" as const,
      durationYears: 4,
      totalCredits: 128,
      tuitionFeePerTerm: "26,000 บาท / ภาคการศึกษา",
      language: "ภาษาไทยและภาษาอังกฤษ (Bilingual Track)",
      descriptionTh: "หลักสูตรมุ่งเน้นการพัฒนานักวิทยาการคอมพิวเตอร์ที่มีความรู้ความสามารถระดับสากล เชี่ยวชาญการออกแบบสถาปัตยกรรมซอฟต์แวร์ ปัญญาประดิษฐ์ ระบบประมวลผลบนคลาวด์ และความมั่นคงปลอดภัยไซเบอร์ พร้อมเรียนรู้จากโจทย์จริงในภาคอุตสาหกรรมดิจิทัล",
      descriptionEn: "The program focuses on developing internationally competent computer scientists specializing in software architecture, artificial intelligence, cloud systems, and cybersecurity with hands-on enterprise projects.",
      careerOpportunities: ["Software Engineer", "AI/ML Engineer", "Cloud Architect", "Cybersecurity Specialist", "DevOps Engineer"],
      studyPlanStructure: [
        { groupName: "1. หมวดวิชาศึกษาทั่วไป (General Education)", credits: 30, description: "ภาษาและการสื่อสาร, นวัตกรรมและการคิดเชิงวิพากษ์, ความเป็นพลเมืองดิจิทัล" },
        { groupName: "2. หมวดวิชาเฉพาะ (Core & Major Courses)", credits: 92, description: "โครงสร้างข้อมูล, อัลกอริทึม, AI & Machine Learning, สถาปัตยกรรมระบบ และโครงงานวิจัย" },
        { groupName: "3. หมวดวิชาเลือกเสรี (Free Electives)", credits: 6, description: "วิชาเลือกเสรีตามความสนใจของผู้เรียนในมหาวิทยาลัย" },
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
      brochureUrl: "https://example.com/cs-curriculum-2565.pdf",
      isActive: true,
      orderSeq: 1,
    },
    {
      departmentId: deptIT.id,
      code: "IT-BSC-2565",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศ",
      nameEn: "Bachelor of Science Program in Information Technology",
      degreeTh: "วิทยาศาสตรบัณฑิต (เทคโนโลยีสารสนเทศ) / วท.บ. (เทคโนโลยีสารสนเทศ)",
      degreeEn: "Bachelor of Science (Information Technology) / B.S. (Information Technology)",
      level: "BACHELOR" as const,
      durationYears: 4,
      totalCredits: 126,
      tuitionFeePerTerm: "24,000 บาท / ภาคการศึกษา",
      language: "ภาษาไทย",
      descriptionTh: "เน้นการประยุกต์ใช้เทคโนโลยีดิจิทัลสำหรับองค์กรธุรกิจ การพัฒนา Full-Stack Web/Mobile Application, UX/UI Design, การบริหารจัดการโครงสร้างพื้นฐานไอที และระบบวิเคราะห์ข้อมูลเพื่อขับเคลื่อนธุรกิจ",
      descriptionEn: "Focuses on applying digital technologies for enterprise businesses, Full-Stack development, UX/UI design, IT infrastructure management, and data-driven business decision making.",
      careerOpportunities: ["Full-Stack Developer", "UX/UI Designer", "IT Business Analyst", "Network & Systems Administrator", "Digital Product Manager"],
      studyPlanStructure: [
        { groupName: "1. หมวดวิชาศึกษาทั่วไป", credits: 30, description: "ทักษะดิจิทัล การสื่อสาร และความเป็นผู้ประกอบการ" },
        { groupName: "2. หมวดวิชาเฉพาะ", credits: 90, description: "การพัฒนาเว็บ/โมบายล์, ระบบฐานข้อมูล, เครือข่ายคอมพิวเตอร์ และการออกแบบ UX/UI" },
        { groupName: "3. หมวดวิชาเลือกเสรี", credits: 6, description: "เลือกเรียนอย่างเสรี" },
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      brochureUrl: "https://example.com/it-curriculum-2565.pdf",
      isActive: true,
      orderSeq: 2,
    },
    {
      departmentId: deptCS.id,
      code: "DS-MSC-2566",
      nameTh: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการข้อมูลและการวิเคราะห์ขั้นสูง",
      nameEn: "Master of Science in Data Science and Advanced Analytics",
      degreeTh: "วิทยาศาสตรมหาบัณฑิต (วิทยาการข้อมูลและการวิเคราะห์ขั้นสูง) / วท.ม. (วิทยาการข้อมูลและการวิเคราะห์ขั้นสูง)",
      degreeEn: "Master of Science (Data Science and Advanced Analytics) / M.S. (Data Science and Advanced Analytics)",
      level: "MASTER" as const,
      durationYears: 2,
      totalCredits: 36,
      tuitionFeePerTerm: "45,000 บาท / ภาคการศึกษา",
      language: "หลักสูตรนานาชาติ (English Program)",
      descriptionTh: "หลักสูตรระดับบัณฑิตศึกษาที่ออกแบบมาเพื่อสร้างผู้นำทางเทคโนโลยีด้าน Data Science, Big Data Architecture, Natural Language Processing และ Deep Learning โดยจัดการเรียนการสอนแบบผสมผสานร่วมกับทีมวิจัยชั้นนำ",
      descriptionEn: "An advanced graduate program designed for tech leaders and researchers in Data Science, Big Data Architecture, Deep Learning, and Predictive Analytics.",
      careerOpportunities: ["Data Scientist", "Machine Learning Specialist", "Big Data Engineer", "Quantitative Researcher", "Chief Data Officer"],
      studyPlanStructure: [
        { groupName: "1. หมวดวิชาบังคับ (Core Courses)", credits: 12, description: "Advanced Machine Learning, Statistical Inference, Big Data Systems" },
        { groupName: "2. หมวดวิชาเลือกเฉพาะทาง (Elective Courses)", credits: 12, description: "NLP, Computer Vision, High Performance Analytics" },
        { groupName: "3. วิทยานิพนธ์ (Master's Thesis)", credits: 12, description: "งานวิจัยสร้างองค์ความรู้ใหม่ระดับสากล" },
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      brochureUrl: "https://example.com/ds-curriculum-2566.pdf",
      isActive: true,
      orderSeq: 3,
    },
    {
      departmentId: deptIT.id,
      code: "AI-CERT-2567",
      nameTh: "หลักสูตรประกาศนียบัตร ปัญญาประดิษฐ์ประยุกต์สำหรับองค์กรดิจิทัล",
      nameEn: "Certificate in Applied Generative AI for Enterprise",
      degreeTh: "ประกาศนียบัตรวิชาชีพเฉพาะทางด้านปัญญาประดิษฐ์ประยุกต์",
      degreeEn: "Certificate of Advanced Studies in Applied Generative AI",
      level: "CERTIFICATE" as const,
      durationYears: 1,
      totalCredits: 15,
      tuitionFeePerTerm: "18,000 บาท / ตลอดหลักสูตร",
      language: "ภาษาไทยและภาษาอังกฤษ",
      descriptionTh: "หลักสูตรการเรียนรู้ตลอดชีวิต (Lifelong Learning) Upskill และ Reskill สำหรับผู้ประกอบการและบุคลากรในสายงานเทคโนโลยี เน้นการประยุกต์ใช้ Generative AI, RAG Systems, AI Agents และการบูรณาการระบบอัตโนมัติในธุรกิจ",
      descriptionEn: "A lifelong learning professional certificate program focusing on practical generative AI, RAG architectures, LLM orchestration, and workflow automation.",
      careerOpportunities: ["AI Solutions Specialist", "Prompt Engineer", "Digital Innovation Lead", "Enterprise Automation Consultant"],
      studyPlanStructure: [
        { groupName: "1. ภาคทฤษฎีและเวิร์กช็อป (Core Modules)", credits: 9, description: "LLMs, Vector Databases, Prompt Engineering, Agentic Workflows" },
        { groupName: "2. โครงงานประยุกต์จริง (Applied Capstone Project)", credits: 6, description: "การพัฒนาระบบ AI ให้แก่องค์กรจริง" },
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      brochureUrl: "https://example.com/ai-cert-2567.pdf",
      isActive: true,
      orderSeq: 4,
    },
  ];

  for (const c of sampleCurriculums) {
    await prisma.curriculum.upsert({
      where: {
        tenantId_code: {
          tenantId: core.tenantId,
          code: c.code,
        },
      },
      update: {},
      create: {
        tenantId: core.tenantId,
        ...c,
      },
    });
  }

  // -------------------------------------------------------------
  // SEED: BOOKING RESOURCES & BOOKINGS (ห้องและยานพาหนะ)
  // -------------------------------------------------------------
  const sampleResources = [
    {
      code: "ROOM-801",
      nameTh: "ห้องประชุมสัมมนาวิชาการ วิจัย และนวัตกรรม (IT-801)",
      nameEn: "Academic & Innovation Seminar Hall (IT-801)",
      type: "ROOM" as const,
      capacity: 80,
      location: "อาคารเทคโนโลยีสารสนเทศ ชั้น 8",
      facilities: ["ระบบ Video Conference Hybrid", "โปรเจกเตอร์ความละเอียดสูง 4K", "ไมโครโฟนไร้สาย 4 ตัว", "เครื่องปรับอากาศ", "Wi-Fi High-Speed"],
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      requiresApproval: true,
      isActive: true,
      orderSeq: 1,
    },
    {
      code: "LAB-501",
      nameTh: "ห้องปฏิบัติการคอมพิวเตอร์และปัญญาประดิษฐ์ (AI & Big Data Lab)",
      nameEn: "AI & Big Data Computer Laboratory (IT-501)",
      type: "ROOM" as const,
      capacity: 45,
      location: "อาคารเทคโนโลยีสารสนเทศ ชั้น 5",
      facilities: ["Workstations 45 เครื่องพร้อม GPU", "โปรเจกเตอร์ฉายสองจอ", "กระดาน Interactive Smart Board", "ระบบ LAN 10Gbps"],
      imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
      requiresApproval: true,
      isActive: true,
      orderSeq: 2,
    },
    {
      code: "MEET-302",
      nameTh: "ห้องประชุมย่อยกรรมการบริหารและวิชาการ (IT-302)",
      nameEn: "Faculty Executive Meeting Room (IT-302)",
      type: "ROOM" as const,
      capacity: 16,
      location: "อาคารเทคโนโลยีสารสนเทศ ชั้น 3",
      facilities: ["Smart TV 65 นิ้ว สำหรับพรีเซนต์", "กล้องหมุนติดตามผู้พูด 360 องศา", "ไมโครโฟนประชุมรอบทิศทาง"],
      imageUrl: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80",
      requiresApproval: false,
      isActive: true,
      orderSeq: 3,
    },
    {
      code: "VAN-01",
      nameTh: "รถตู้โดยสารปรับอากาศ VIP คณะ (ทะเบียน ฮษ-8901 กทม.)",
      nameEn: "Faculty VIP Commuter Van (License 8901)",
      type: "VEHICLE" as const,
      capacity: 11,
      location: "โรงจอดรถยนต์ส่วนกลาง ชั้น 1 คณะ",
      facilities: ["เบาะนั่งปรับเอน VIP", "เข็มขัดนิรภัยอัตโนมัติทุกที่นั่ง", "ระบบ GPS ติดตามยานพาหนะ", "ที่ชาร์จ USB ทุกแถว"],
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      requiresApproval: true,
      isActive: true,
      orderSeq: 4,
    },
  ];

  const createdResources = [];
  for (const r of sampleResources) {
    const res = await prisma.bookingResource.upsert({
      where: {
        tenantId_code: {
          tenantId: core.tenantId,
          code: r.code,
        },
      },
      update: {},
      create: {
        tenantId: core.tenantId,
        ...r,
      },
    });
    createdResources.push(res);
  }

  // Seed 2 sample bookings
  const now = new Date();
  const tomorrowMorningStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
  const tomorrowMorningEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);

  const dayAfterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 13, 30, 0);
  const dayAfterEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 16, 30, 0);

  if (adminUser && createdResources[0]) {
    await prisma.resourceBooking.upsert({
      where: {
        tenantId_bookingNumber: {
          tenantId: core.tenantId,
          bookingNumber: "BK-2026-0001",
        },
      },
      update: {},
      create: {
        tenantId: core.tenantId,
        resourceId: createdResources[0].id,
        userId: adminUser.id,
        bookingNumber: "BK-2026-0001",
        title: "การประชุมคณะกรรมการพัฒนาหลักสูตรและทวนสอบผลสัมฤทธิ์ทางการศึกษา",
        startAt: tomorrowMorningStart,
        endAt: tomorrowMorningEnd,
        attendeesCount: 25,
        status: "APPROVED",
        contactPhone: "081-234-5678",
        notes: "ต้องการเตรียมชุดไมค์ไร้สาย 4 ตัว และเชื่อมต่อ Zoom ห้องประชุม",
        approvedById: adminUser.id,
        approvedAt: now,
      },
    });
  }

  if (adminUser && createdResources[1]) {
    await prisma.resourceBooking.upsert({
      where: {
        tenantId_bookingNumber: {
          tenantId: core.tenantId,
          bookingNumber: "BK-2026-0002",
        },
      },
      update: {},
      create: {
        tenantId: core.tenantId,
        resourceId: createdResources[1].id,
        userId: adminUser.id,
        bookingNumber: "BK-2026-0002",
        title: "เวิร์กช็อปฝึกอบรม Hands-on Generative AI สำหรับนักศึกษาชั้นปีที่ 3",
        startAt: dayAfterStart,
        endAt: dayAfterEnd,
        attendeesCount: 40,
        status: "PENDING",
        contactPhone: "089-999-8888",
        notes: "ขอความอนุเคราะห์ลง Python 3.12 และ Ollama บนเครื่องเวิร์กสเตชัน",
      },
    });
  }

  // -------------------------------------------------------------
  // SEED: RESEARCH PROJECTS & PUBLICATIONS (วิจัยและนวัตกรรม)
  // -------------------------------------------------------------
  const proj1 = await prisma.researchProject.upsert({
    where: {
      tenantId_code: { tenantId: core.tenantId, code: "RES-2026-001" },
    },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "RES-2026-001",
      titleTh: "โครงการวิจัยและพัฒนาระบบตรวจจับและพยากรณ์โรคใบข้าวด้วยปัญญาประดิษฐ์เชิงลึกและภาพถ่ายโดรน",
      titleEn: "Deep Learning and Drone Telemetry for Early Rice Leaf Disease Detection and Forecasting",
      abstractTh: "การประยุกต์ใช้โมเดล Vision Transformer ร่วมกับกล้อง Multi-spectral บนโดรนเพื่อตรวจจับการระบาดของโรคไหม้ในแปลงนาข้าวแบบเรียลไทม์",
      abstractEn: "Application of Vision Transformer models combined with multi-spectral drone cameras for real-time rice blast epidemic detection.",
      leaderName: "รศ.ดร.สมชาย ใจดี",
      leaderId: adminUser?.id ?? null,
      members: ["ผศ.ดร.กานดา สุขใจ", "ดร.วิชัย นวัตกรรม"],
      departmentId: deptCS.id,
      budget: 650000,
      fundingSource: "สำนักงานการวิจัยแห่งชาติ (วช.)",
      startDate: new Date(2025, 9, 1),
      endDate: new Date(2026, 8, 30),
      status: "IN_PROGRESS",
      coverImageUrl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80",
    },
  });

  const proj2 = await prisma.researchProject.upsert({
    where: {
      tenantId_code: { tenantId: core.tenantId, code: "RES-2026-002" },
    },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "RES-2026-002",
      titleTh: "แพลตฟอร์มบริหารจัดการพลังงานอัจฉริยะในอาคารมหาวิทยาลัยด้วย IoT และ Reinforcement Learning",
      titleEn: "Campus Microgrid Smart Energy Management Platform via IoT and Reinforcement Learning",
      abstractTh: "ระบบควบคุมอุณหภูมิและบริหารการใช้พลังงานไฟฟ้าของระบบปรับอากาศส่วนกลางด้วยอัลกอริทึม Deep Q-Network เพื่อลดคาร์บอนฟุตพริ้นท์",
      abstractEn: "Automated HVAC control and energy optimization platform powered by Deep Q-Networks targeting zero-carbon campus benchmarks.",
      leaderName: "ผศ.ดร.กานดา สุขใจ",
      members: ["อาจารย์ธนพล ดิจิทัล", "ดร.สมศรี ปัญญา"],
      departmentId: deptIT.id,
      budget: 480000,
      fundingSource: "กองทุนส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม (สกสว.)",
      startDate: new Date(2025, 5, 1),
      endDate: new Date(2026, 4, 30),
      status: "IN_PROGRESS",
      coverImageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
    },
  });

  await prisma.researchProject.upsert({
    where: {
      tenantId_code: { tenantId: core.tenantId, code: "RES-2025-003" },
    },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "RES-2025-003",
      titleTh: "โมเดลภาษาขนาดใหญ่เฉพาะทางสำหรับเวชระเบียนและการประเมินความเสี่ยงผู้ป่วยภาษาไทย",
      titleEn: "Domain-Specific Large Language Model for Thai Clinical Records and Patient Risk Stratification",
      abstractTh: "การพัฒนาชุดข้อมูลคำศัพท์และการปรับจูนโมเดล Open-weight LLM สำหรับการวิเคราะห์สรุปประวัติผู้ป่วยและการสนับสนุนการตัดสินใจของแพทย์",
      abstractEn: "Instruction fine-tuning of open-weight LLMs for Thai clinical summaries and medical decision support.",
      leaderName: "รศ.ดร.สมชาย ใจดี",
      members: ["ดร.วิชัย นวัตกรรม"],
      departmentId: deptCS.id,
      budget: 1200000,
      fundingSource: "สถาบันวิจัยระบบสาธารณสุข (สวรส.)",
      startDate: new Date(2024, 9, 1),
      endDate: new Date(2025, 8, 30),
      status: "COMPLETED",
      coverImageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    },
  });

  // Seed sample publications
  const samplePublications = [
    {
      projectId: proj1.id,
      title: "Multi-Scale Vision Transformer for Precision Rice Blast Disease Severity Classification",
      authors: "Somchai Jaidee, Kanda Sukjai, Wichai Innovation",
      journalOrConference: "IEEE Access (Impact Factor 3.9)",
      publicationType: "JOURNAL_INTERNATIONAL" as const,
      tier: "Q1",
      doi: "10.1109/ACCESS.2026.3129841",
      year: 2026,
      url: "https://ieeexplore.ieee.org",
    },
    {
      projectId: proj2.id,
      title: "Deep Reinforcement Learning for Real-Time Campus Microgrid Optimization",
      authors: "Kanda Sukjai, Thanapol Digital",
      journalOrConference: "Applied Energy (Elsevier)",
      publicationType: "JOURNAL_INTERNATIONAL" as const,
      tier: "Q1",
      doi: "10.1016/j.apenergy.2026.119024",
      year: 2026,
      url: "https://sciencedirect.com",
    },
    {
      title: "ThaiMed-LLM: Domain-Adapted Clinical Language Model for Electronic Health Records",
      authors: "Somchai Jaidee, Wichai Innovation",
      journalOrConference: "ACM Transactions on Computing for Healthcare",
      publicationType: "JOURNAL_INTERNATIONAL" as const,
      tier: "Q1",
      doi: "10.1145/3589412",
      year: 2025,
      url: "https://dl.acm.org",
    },
    {
      title: "Edge Telemetry Architecture for Precision Agriculture in Tropical Climates",
      authors: "Wichai Innovation, Somchai Jaidee",
      journalOrConference: "Thai Journal of Science and Technology (TJST)",
      publicationType: "JOURNAL_NATIONAL" as const,
      tier: "TCI 1",
      doi: null,
      year: 2025,
      url: "https://tci-thaijo.org",
    },
  ];

  for (const pub of samplePublications) {
    const existing = await prisma.publication.findFirst({
      where: { tenantId: core.tenantId, title: pub.title },
    });
    if (!existing) {
      await prisma.publication.create({
        data: {
          tenantId: core.tenantId,
          ...pub,
        },
      });
    }
  }

  // -------------------------------------------------------------
  // SEED: E-DOCUMENT TEMPLATES & REQUESTS (คำร้องและอนุมัติเอกสาร)
  // -------------------------------------------------------------
  const tplTravel = await prisma.documentTemplate.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "REQ-OFFICIAL-TRAVEL" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "REQ-OFFICIAL-TRAVEL",
      nameTh: "แบบฟอร์มขออนุมัติเดินทางไปปฏิบัติงานและประชุมวิชาการ",
      nameEn: "Official Travel & Academic Conference Request",
      category: "งานวิชาการและราชการ",
      orderSeq: 1,
      isActive: true,
      formFields: [
        { name: "destination", label: "สถานที่ไปปฏิบัติงาน", type: "text", required: true },
        { name: "purpose", label: "วัตถุประสงค์ / ชื่อการประชุม", type: "textarea", required: true },
        { name: "travelDate", label: "ช่วงวันเดินทาง", type: "date-range", required: true },
        { name: "estimatedBudget", label: "งบประมาณโดยประมาณ (บาท)", type: "number", required: false },
      ],
    },
  });

  await prisma.documentTemplate.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "REQ-BUDGET-DISBURSE" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "REQ-BUDGET-DISBURSE",
      nameTh: "แบบฟอร์มขออนุมัติเบิกจ่ายงบประมาณโครงการวิจัย",
      nameEn: "Research Project Budget Disbursement Request",
      category: "งบประมาณและการเงิน",
      orderSeq: 2,
      isActive: true,
      formFields: [
        { name: "projectCode", label: "รหัสโครงการวิจัย", type: "text", required: true },
        { name: "amount", label: "จำนวนเงินที่ขอเบิกจ่าย", type: "number", required: true },
        { name: "expenseCategory", label: "หมวดหมู่ค่าใช้จ่าย", type: "select", required: true },
      ],
    },
  });

  if (adminUser) {
    // Seed sample approval requests
    const req1 = await prisma.approvalRequest.upsert({
      where: {
        tenantId_requestNumber: {
          tenantId: core.tenantId,
          requestNumber: "REQ-2026-0001",
        },
      },
      update: {},
      create: {
        tenantId: core.tenantId,
        requestNumber: "REQ-2026-0001",
        templateId: tplTravel.id,
        title: "ขออนุมัติเดินทางนำเสนอผลงานวิจัย ณ งานประชุมวิชาการ IEEE ICASSP 2026 ประเทศญี่ปุ่น",
        requesterId: adminUser.id,
        departmentId: deptCS.id,
        priority: "HIGH",
        formData: {
          destination: "เกียวโต ประเทศญี่ปุ่น",
          purpose: "นำเสนอผลงานวิจัย Multi-scale Vision Transformer",
          estimatedBudget: 45000,
        },
        attachmentUrls: ["https://example.com/papers/accepted-letter.pdf"],
        status: "APPROVED",
        currentApproverId: adminUser.id,
      },
    });

    const existingHist = await prisma.approvalHistory.findFirst({
      where: { requestId: req1.id },
    });
    if (!existingHist) {
      await prisma.approvalHistory.createMany({
        data: [
          {
            requestId: req1.id,
            actorId: adminUser.id,
            action: "SUBMIT",
            comments: "ยื่นคำขอพร้อมเอกสารตอบรับจากผู้จัดงานประชุมวิชาการ",
          },
          {
            requestId: req1.id,
            actorId: adminUser.id,
            action: "APPROVE",
            comments: "อนุมัติตามระเบียบการสนับสนุนงบประมาณพัฒนาบุคลากรวิจัย",
          },
        ],
      });
    }

    await prisma.approvalRequest.upsert({
      where: {
        tenantId_requestNumber: {
          tenantId: core.tenantId,
          requestNumber: "REQ-2026-0002",
        },
      },
      update: {},
      create: {
        tenantId: core.tenantId,
        requestNumber: "REQ-2026-0002",
        templateId: tplTravel.id,
        title: "ขออนุมัติจัดซื้อการ์ดประมวลผล GPU Server สำหรับห้องปฏิบัติการปัญญาประดิษฐ์",
        requesterId: adminUser.id,
        departmentId: deptIT.id,
        priority: "URGENT",
        formData: {
          destination: "คณะเทคโนโลยีสารสนเทศ",
          purpose: "ใช้ในการเรียนการสอนวิชา AI และประมวลผลโมเดลวิจัย",
          estimatedBudget: 120000,
        },
        status: "SUBMITTED",
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Seed Feature 3: Budget & Finance
  // ---------------------------------------------------------------------------
  const fy2569 = await prisma.fiscalYear.upsert({
    where: { tenantId_year: { tenantId: core.tenantId, year: 2569 } },
    update: {},
    create: {
      tenantId: core.tenantId,
      year: 2569,
      totalBudget: 45000000,
      allocatedBudget: 38500000,
      spentBudget: 24150000,
      startDate: new Date("2025-10-01T00:00:00Z"),
      endDate: new Date("2026-09-30T23:59:59Z"),
      isActive: true,
    },
  });

  const plan1 = await prisma.budgetPlan.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "PLAN-69-001" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      fiscalYearId: fy2569.id,
      code: "PLAN-69-001",
      nameTh: "งบบุคลากรและค่าตอบแทนผู้เชี่ยวชาญพิเศษ",
      nameEn: "Personnel and Special Expert Compensation",
      category: "PERSONNEL",
      departmentId: deptCS.id,
      allocatedAmount: 15000000,
      spentAmount: 10500000,
      orderSeq: 1,
    },
  });

  const plan2 = await prisma.budgetPlan.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "PLAN-69-002" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      fiscalYearId: fy2569.id,
      code: "PLAN-69-002",
      nameTh: "งบดำเนินงานจัดการเรียนการสอนและการฝึกปฏิบัติการ",
      nameEn: "Instruction and Laboratory Operating Expenses",
      category: "OPERATING",
      departmentId: deptIT.id,
      allocatedAmount: 8500000,
      spentAmount: 5200000,
      orderSeq: 2,
    },
  });

  const plan3 = await prisma.budgetPlan.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "PLAN-69-003" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      fiscalYearId: fy2569.id,
      code: "PLAN-69-003",
      nameTh: "โครงการจัดหาและอัปเกรด High Performance Computing Cluster",
      nameEn: "High Performance Computing Cluster Procurement",
      category: "INVESTMENT",
      allocatedAmount: 7000000,
      spentAmount: 4800000,
      orderSeq: 3,
    },
  });

  await prisma.budgetPlan.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "PLAN-69-004" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      fiscalYearId: fy2569.id,
      code: "PLAN-69-004",
      nameTh: "ทุนอุดหนุนการวิจัยและตีพิมพ์ระดับนานาชาติ (Q1/Q2)",
      nameEn: "International Research Grants and Publication Support",
      category: "SUBSIDY",
      allocatedAmount: 5000000,
      spentAmount: 2650000,
      orderSeq: 4,
    },
  });

  await prisma.budgetPlan.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "PLAN-69-005" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      fiscalYearId: fy2569.id,
      code: "PLAN-69-005",
      nameTh: "โครงการพัฒนาความร่วมมือกับภาคอุตสาหกรรมและการบริการวิชาการ",
      nameEn: "Industry Collaboration & Academic Services",
      category: "OTHER",
      allocatedAmount: 3000000,
      spentAmount: 1000000,
      orderSeq: 5,
    },
  });

  if (adminUser) {
    const txCount = await prisma.budgetTransaction.count({ where: { tenantId: core.tenantId } });
    if (txCount === 0) {
      await prisma.budgetTransaction.createMany({
        data: [
          {
            tenantId: core.tenantId,
            planId: plan3.id,
            description: "จัดซื้อ GPU Node A100 ประมวลผลสำหรับแล็บปัญญาประดิษฐ์",
            amount: 1800000,
            type: "EXPENSE",
            referenceDoc: "PO-2569-0012",
            recordedById: adminUser.id,
          },
          {
            tenantId: core.tenantId,
            planId: plan1.id,
            description: "ค่าตอบแทนวิทยากรผู้เชี่ยวชาญพิเศษเทคโนโลยี Generative AI",
            amount: 150000,
            type: "EXPENSE",
            referenceDoc: "EXP-2569-0085",
            recordedById: adminUser.id,
          },
          {
            tenantId: core.tenantId,
            planId: plan2.id,
            description: "ค่าลิขสิทธิ์ซอฟต์แวร์ Cloud & DevOps Sandbox สำหรับนักศึกษา",
            amount: 320000,
            type: "EXPENSE",
            referenceDoc: "SO-2569-0043",
            recordedById: adminUser.id,
          },
        ],
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Seed Feature 4: Strategic Plan & KPIs
  // ---------------------------------------------------------------------------
  const stratPlan = await prisma.strategicPlan.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      tenantId: core.tenantId,
      nameTh: "แผนยุทธศาสตร์การพัฒนาคณะสู่ความเป็นเลิศด้านเทคโนโลยีดิจิทัล (พ.ศ. 2566 - 2570)",
      nameEn: "Faculty Strategic Development Plan towards Digital Excellence (2023 - 2027)",
      startYear: 2566,
      endYear: 2570,
      visionTh: "เป็นคณะชั้นนำระดับประเทศและภูมิภาคอาเซียนในการสร้างองค์ความรู้ นวัตกรรม และบัณฑิตที่มีสมรรถนะสูงด้านปัญญาประดิษฐ์และเทคโนโลยีดิจิทัล",
      visionEn: "To be a leading faculty in the country and ASEAN region in creating knowledge, innovation, and high-caliber digital & AI workforce.",
      missionTh: "1. จัดการศึกษาที่เน้นสมรรถนะตรงกับความต้องการของอุตสาหกรรมสากล\n2. ผลิตงานวิจัยและนวัตกรรมที่มีมูลค่าและผลกระทบสูงต่อสังคมและเศรษฐกิจ\n3. บูรณาการบริการวิชาการเพื่อยกระดับขีดความสามารถของชุมชนและประเทศ\n4. พัฒนาระบบบริหารจัดการองค์กรที่ทันสมัย ขับเคลื่อนด้วยข้อมูล (Data-Driven Organization)",
      missionEn: "1. Deliver competency-based education matching global industry demands.\n2. Produce high-impact research and technological innovations.\n3. Integrate academic services to elevate community and national competitiveness.\n4. Cultivate modern, data-driven organizational excellence.",
      isActive: true,
    },
  });

  const p1 = await prisma.strategicPillar.upsert({
    where: { tenantId_planId_code: { tenantId: core.tenantId, planId: stratPlan.id, code: "PIL-1" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      planId: stratPlan.id,
      code: "PIL-1",
      orderSeq: 1,
      titleTh: "ยุทธศาสตร์ที่ 1: การจัดการศึกษาและพัฒนาบัณฑิตสู่สากล",
      titleEn: "Pillar 1: World-Class Education & Graduate Development",
      description: "ยกระดับมาตรฐานหลักสูตรสู่ระดับสากล บูรณาการการเรียนรู้ผ่านโครงงานจริง และผลิตบัณฑิตพร้อมทำงานในตลาดสากล",
    },
  });

  const p2 = await prisma.strategicPillar.upsert({
    where: { tenantId_planId_code: { tenantId: core.tenantId, planId: stratPlan.id, code: "PIL-2" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      planId: stratPlan.id,
      code: "PIL-2",
      orderSeq: 2,
      titleTh: "ยุทธศาสตร์ที่ 2: การวิจัยขั้นสูงและนวัตกรรมมูลค่าสูง",
      titleEn: "Pillar 2: Advanced Research & High-Impact Innovation",
      description: "ส่งเสริมงานวิจัยเชิงลึกด้าน AI, Cloud, Cybersecurity และการสร้างสรรค์ทรัพย์สินทางปัญญาที่มีมูลค่าเชิงพาณิชย์",
    },
  });

  const p3 = await prisma.strategicPillar.upsert({
    where: { tenantId_planId_code: { tenantId: core.tenantId, planId: stratPlan.id, code: "PIL-3" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      planId: stratPlan.id,
      code: "PIL-3",
      orderSeq: 3,
      titleTh: "ยุทธศาสตร์ที่ 3: การบริการวิชาการและความร่วมมือภาคอุตสาหกรรม",
      titleEn: "Pillar 3: Academic Service & Industry Partnerships",
      description: "สร้างความร่วมมือเชิงลึกกับพันธมิตรภาคเอกชน ถ่ายทอดเทคโนโลยี และยกระดับขีดความสามารถดิจิทัลของชุมชน",
    },
  });

  const p4 = await prisma.strategicPillar.upsert({
    where: { tenantId_planId_code: { tenantId: core.tenantId, planId: stratPlan.id, code: "PIL-4" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      planId: stratPlan.id,
      code: "PIL-4",
      orderSeq: 4,
      titleTh: "ยุทธศาสตร์ที่ 4: การบริหารจัดการองค์กรสู่ความยั่งยืน",
      titleEn: "Pillar 4: Sustainable Smart Organization",
      description: "พัฒนาระบบบริหารจัดการดิจิทัล การกำกับดูแลที่ดี ความโปร่งใส และการสร้างสภาพแวดล้อมที่เอื้อต่อการเรียนรู้",
    },
  });

  // Seed Strategic KPIs
  await prisma.strategicKpi.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "KPI-1.1" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      pillarId: p1.id,
      code: "KPI-1.1",
      nameTh: "ร้อยละของผู้สำเร็จการศึกษาที่มีงานทำหรือประกอบอาชีพอิสระภายใน 1 ปี",
      nameEn: "Employment rate within 1 year of graduation",
      targetValue: 95.0,
      actualValue: 94.2,
      unit: "%",
      status: "ON_TRACK",
      period: "2569",
    },
  });

  await prisma.strategicKpi.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "KPI-1.2" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      pillarId: p1.id,
      code: "KPI-1.2",
      nameTh: "จำนวนนักศึกษาที่สอบผ่านใบรับรองวิชาชีพมาตรฐานสากล (IT Certifications)",
      nameEn: "Students achieving international IT certifications",
      targetValue: 150,
      actualValue: 172,
      unit: "คน",
      status: "ACHIEVED",
      period: "2569",
    },
  });

  await prisma.strategicKpi.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "KPI-2.1" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      pillarId: p2.id,
      code: "KPI-2.1",
      nameTh: "จำนวนบทความวิจัยที่ได้รับการตีพิมพ์ในวารสารระดับนานาชาติ Scopus/ISI Q1-Q2",
      nameEn: "Scopus/ISI Q1-Q2 international publications",
      targetValue: 35,
      actualValue: 38,
      unit: "ผลงาน",
      status: "ACHIEVED",
      period: "2569",
    },
  });

  await prisma.strategicKpi.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "KPI-2.2" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      pillarId: p2.id,
      code: "KPI-2.2",
      nameTh: "มูลค่าทุนวิจัยที่ได้รับจากแหล่งทุนภายนอกและภาคอุตสาหกรรม",
      nameEn: "External research funding value",
      targetValue: 15.0,
      actualValue: 13.8,
      unit: "ล้านบาท",
      status: "ON_TRACK",
      period: "2569",
    },
  });

  await prisma.strategicKpi.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "KPI-3.1" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      pillarId: p3.id,
      code: "KPI-3.1",
      nameTh: "จำนวนโครงการบริการวิชาการที่สร้างผลกระทบต่อชุมชนและสังคม",
      nameEn: "Community & social impact projects",
      targetValue: 10,
      actualValue: 8,
      unit: "โครงการ",
      status: "ON_TRACK",
      period: "2569",
    },
  });

  await prisma.strategicKpi.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "KPI-4.1" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      pillarId: p4.id,
      code: "KPI-4.1",
      nameTh: "ร้อยละผลการประเมินคุณธรรมและความโปร่งใส (ITA) ของคณะ",
      nameEn: "Integrity and Transparency Assessment (ITA) Score",
      targetValue: 92.0,
      actualValue: 89.5,
      unit: "%",
      status: "AT_RISK",
      period: "2569",
    },
  });

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
