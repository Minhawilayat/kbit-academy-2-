import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Server, 
  Cpu, 
  Globe, 
  Mail, 
  Phone, 
  Facebook, 
  Youtube, 
  Instagram, 
  ChevronRight, 
  CheckCircle2, 
  Users, 
  Award,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Send,
  Loader2,
  Bot,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const COURSE_DATA = [
  {
    id: 'mcse',
    title: 'MCSE Certification',
    description: 'Master Microsoft Server infrastructure and cloud solutions with our comprehensive MCSE track.',
    icon: <Server className="text-accent" size={32} />,
    tag: 'Infrastructure',
    fullDescription: 'The Microsoft Certified Solutions Expert (MCSE) certification validates that you have the skills needed to run a highly efficient and modern data center, with expertise in identity management, systems management, virtualization, storage, and networking.',
    duration: '6 Months',
    level: 'Advanced',
    modules: [
      'Installing and Configuring Windows Server 2022',
      'Administering Windows Server 2022',
      'Configuring Advanced Windows Server Services',
      'Designing and Implementing a Server Infrastructure',
      'Implementing an Advanced Server Infrastructure'
    ]
  },
  {
    id: 'vmware',
    title: 'VMware vSphere 8',
    description: 'Learn the industry-standard virtualization platform. Install, configure, and manage vSphere 8.',
    icon: <Cpu className="text-accent" size={32} />,
    tag: 'Virtualization',
    fullDescription: 'This course explores installation, configuration, and management of VMware vSphere 8, which consists of VMware ESXi 8.0 and VMware vCenter Server 8.0. This course prepares you to administer a vSphere infrastructure for an organization of any size.',
    duration: '3 Months',
    level: 'Intermediate',
    modules: [
      'Introduction to vSphere and the Software-Defined Data Center',
      'Creating Virtual Machines',
      'vCenter Server Architecture',
      'Configuring and Managing Virtual Networks',
      'Configuring and Managing Virtual Storage'
    ]
  },
  {
    id: 'ccna',
    title: 'Cisco CCNA',
    description: 'Build a strong foundation in networking, security, and automation with Cisco certified training.',
    icon: <Globe className="text-accent" size={32} />,
    tag: 'Networking',
    fullDescription: 'The Cisco Certified Network Associate (CCNA) certification program provides a foundation for a career in networking. It covers a broad range of fundamentals based on the latest technologies, software development skills, and job roles.',
    duration: '4 Months',
    level: 'Beginner to Intermediate',
    modules: [
      'Network Fundamentals',
      'Network Access',
      'IP Connectivity',
      'IP Services',
      'Security Fundamentals',
      'Automation and Programmability'
    ]
  },
  {
    id: 'cyber-security',
    title: 'Cyber Security',
    description: 'Protect digital assets and learn ethical hacking, network defense, and security protocols.',
    icon: <CheckCircle2 className="text-accent" size={32} />,
    tag: 'Security',
    fullDescription: 'Our Cyber Security program is designed to provide you with the skills and knowledge necessary to protect computer systems, networks, and data from digital attacks. You will learn about ethical hacking, risk management, and incident response.',
    duration: '5 Months',
    level: 'Intermediate to Advanced',
    modules: [
      'Introduction to Cybersecurity',
      'Network Security and Defense',
      'Ethical Hacking and Penetration Testing',
      'Digital Forensics and Incident Response',
      'Cloud Security and Compliance'
    ]
  }
];

// Custom Cursor Component
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 border border-accent rounded-full pointer-events-none z-[9999] hidden md:block"
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: isPointer ? 2.5 : 1,
        backgroundColor: isPointer ? 'rgba(255, 92, 0, 0.1)' : 'transparent',
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.5 }}
    />
  );
};

const NoiseOverlay = () => <div className="noise-overlay" />;

// Utility for smooth scrolling with offset
const scrollToId = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Courses', href: '/#courses' },
    { name: 'About', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
  ];

  const handleLinkClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const id = href.substring(2);
      if (isHome) {
        scrollToId(id);
      }
    } else if (href === '/' && isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled || !isHome ? 'bg-white/90 backdrop-blur-xl border-b border-primary/5 py-4' : 'bg-transparent py-10'}`}>
      <div className="max-w-[1800px] mx-auto px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="w-12 h-12 bg-primary flex items-center justify-center text-white font-black text-2xl transition-transform group-hover:rotate-[135deg]">KB</div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black uppercase tracking-[-0.05em] text-primary leading-none">KBIT</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent leading-none mt-1">Academy</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-16">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href} 
              onClick={() => handleLinkClick(link.href)}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 hover:text-primary transition-all relative group"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-accent transition-all group-hover:w-full" />
            </Link>
          ))}
          <Link to="/enroll" className="relative group overflow-hidden bg-primary px-10 py-4 text-white text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="relative z-10">Enroll Now</span>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden w-12 h-12 flex items-center justify-center border border-primary/10" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-[60] p-12 flex flex-col justify-center items-center gap-12 md:hidden"
          >
            <button className="absolute top-12 right-12 w-16 h-16 flex items-center justify-center border border-primary/10" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={32} />
            </button>
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  to={link.href} 
                  className="text-6xl font-black uppercase tracking-tighter text-primary hover:text-accent transition-colors"
                  onClick={() => handleLinkClick(link.href)}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
            <Link to="/enroll" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full max-w-sm text-center py-8 text-xl mt-12">Get Started</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden bg-white">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            rotate: 360,
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-[1000px] h-[1000px] border border-primary/[0.03] rounded-full"
        />
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>
      
      <div className="max-w-[1800px] mx-auto px-12 w-full grid lg:grid-cols-12 gap-0 items-stretch relative z-10">
        <div className="lg:col-span-8 py-24 lg:py-48 relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-6 mb-16">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-accent">Excellence in IT Education</span>
            </div>
            
            <div className="relative mb-16">
              <h1 className="text-[14vw] lg:text-[160px] font-black leading-[0.8] uppercase tracking-[-0.04em] text-primary relative z-10">
                <motion.span 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="block"
                >
                  Future
                </motion.span>
                <motion.span 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="block text-transparent ml-[10%]"
                  style={{ WebkitTextStroke: '2px #0A0A0A' }}
                >
                  Engineered
                </motion.span>
              </h1>
              
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/10 origin-left -translate-y-1/2"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-2xl text-slate-500 leading-tight font-medium max-w-md"
              >
                We don't just teach IT. We build the architects of the digital era. Master global standards with precision.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex flex-col gap-8"
              >
                <Link 
                  to="/enroll" 
                  className="group relative inline-flex items-center justify-center bg-primary text-white px-12 py-6 text-xs font-black uppercase tracking-[0.4em] overflow-hidden self-start"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <div className="absolute inset-0 bg-accent translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                </Link>
                
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="student" className="w-full h-full object-cover grayscale" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Join 500+ Experts</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4 relative hidden lg:flex items-center justify-center">
          <div className="absolute inset-0 border-l border-primary/5" />
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-[80%] relative group"
          >
            <img 
              src="https://picsum.photos/seed/tech-abstract/1000/1500" 
              alt="IT Training" 
              className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border-[20px] border-white/10 m-8 pointer-events-none" />
            
            {/* Floating Info Card */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-12 top-1/4 glass-card p-10 max-w-[240px] border-primary/10"
            >
              <p className="text-4xl font-black text-primary mb-2">98%</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">Success rate in global certifications</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  const stats = [
    { label: 'Courses Offered', value: '25+', id: 'courses' },
    { label: 'Certified Students', value: '1,200+', id: 'about' },
    { label: 'Expert Trainers', value: '15+', id: 'about' },
    { label: 'Success Rate', value: '98%', id: 'about' },
  ];

  return (
    <section className="bg-primary text-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto grid md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="p-16 border-r border-white/5 last:border-r-0 relative group overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-7xl font-black mb-6 tracking-tighter group-hover:text-accent transition-colors duration-500">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{stat.label}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 text-[120px] font-black text-white/[0.02] select-none pointer-events-none">
              0{index + 1}
            </div>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-[98%] transition-transform duration-700" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Courses = () => {
  return (
    <section id="courses" className="py-48 bg-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-12">
        <div className="grid lg:grid-cols-12 gap-24 mb-32 items-end">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8"
          >
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-[1px] bg-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-accent">Curated Specializations</span>
            </div>
            <h2 className="text-[12vw] lg:text-[140px] font-black text-primary uppercase tracking-[-0.05em] leading-[0.8]">
              Master <br />
              The <span className="text-accent italic">Craft.</span>
            </h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4"
          >
            <p className="text-2xl text-slate-500 leading-tight font-medium border-l-4 border-primary pl-8">
              Our curriculum is engineered for the modern industry. From infrastructure to security, we provide the tools to dominate the IT landscape.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-primary/5">
          {COURSE_DATA.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-16 border-r border-b border-primary/5 last:border-r-0 overflow-hidden bg-white"
            >
              <div className="relative z-10">
                <div className="mb-16 w-16 h-16 bg-slate-50 flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all duration-500 rounded-2xl">
                  {course.icon}
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mb-6 block">{course.tag}</span>
                <h3 className="text-3xl font-black text-primary mb-8 uppercase tracking-tighter leading-none">{course.title}</h3>
                <p className="text-slate-500 text-lg leading-snug mb-16 font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                  {course.description}
                </p>
                <Link to={`/course/${course.id}`} className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary group/link">
                  <span className="relative">
                    View Specs
                    <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left" />
                  </span>
                  <ArrowRight size={14} className="group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>
              
              {/* Background Number Accent */}
              <div className="absolute -bottom-10 -right-6 text-[180px] font-black text-primary/[0.02] select-none pointer-events-none group-hover:text-accent/[0.05] transition-colors">
                0{index + 1}
              </div>
              
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-48 bg-slate-50 overflow-hidden relative">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-[1800px] mx-auto px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-32 items-center">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-[1px] bg-accent" />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-accent">Our Philosophy</span>
              </div>
              <h2 className="text-[10vw] lg:text-[120px] font-black text-primary uppercase tracking-[-0.05em] leading-[0.8] mb-16">
                Redefining <br />
                The <span className="text-accent">Standard.</span>
              </h2>
              <div className="space-y-10 text-2xl text-slate-500 leading-tight font-medium max-w-xl">
                <p>
                  KBIT Academy is a laboratory for the next generation of IT leaders. We bridge the gap between academic theory and industrial reality.
                </p>
                <p className="text-primary font-black uppercase tracking-tighter">
                  Precision. Innovation. Excellence.
                </p>
              </div>
              
              <div className="mt-24 grid grid-cols-2 gap-16 border-t border-primary/10 pt-16">
                <div className="group">
                  <p className="text-6xl font-black text-primary mb-4 group-hover:text-accent transition-colors">100%</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Practical Labs</p>
                </div>
                <div className="group">
                  <p className="text-6xl font-black text-primary mb-4 group-hover:text-accent transition-colors">Global</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Certifications</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] overflow-hidden group"
            >
              <img 
                src="https://picsum.photos/seed/about-tech-2/1200/1500" 
                alt="About KBIT" 
                className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-[40px] border-white/5 m-12 pointer-events-none" />
            </motion.div>
            
            {/* Floating Quote Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute -bottom-16 -left-16 glass-card-dark p-16 max-w-md hidden xl:block shadow-2xl"
            >
              <p className="text-2xl font-black text-white leading-tight mb-10 italic tracking-tight">
                "We transform raw talent into world-class IT engineers."
              </p>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-accent flex items-center justify-center text-white font-black text-2xl">KB</div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-white">Director KBIT</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Lead Infrastructure Engineer</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: 'Course Inquiry',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await addDoc(collection(db, 'inquiries'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setStatus('success');
      setFormData({ fullName: '', email: '', subject: 'Course Inquiry', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-48 bg-white overflow-hidden relative">
      <div className="max-w-[1800px] mx-auto px-12">
        <div className="grid lg:grid-cols-12 gap-32">
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-[1px] bg-accent" />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-accent">Transmission</span>
              </div>
              <h2 className="text-[10vw] lg:text-[120px] font-black text-primary uppercase tracking-[-0.05em] leading-[0.8] mb-16">
                Connect <br />
                With <span className="text-accent">Us.</span>
              </h2>
              
              <div className="space-y-16 mt-24">
                {[
                  { label: 'Direct Line', value: '+92 346 9307175', icon: Phone },
                  { label: 'Email Protocol', value: 'query@kbit.com.pk', icon: Mail },
                  { label: 'Coordinates', value: 'Buner, KP, Pakistan', icon: Globe }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-10 group">
                    <div className="w-20 h-20 bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <item.icon size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3">{item.label}</p>
                      <p className="text-3xl font-black text-primary tracking-tighter uppercase">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute -inset-8 border border-primary/5 pointer-events-none" />
              <div className="bg-primary p-16 lg:p-24 relative overflow-hidden">
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
                
                <form onSubmit={handleSubmit} className="space-y-16 relative z-10">
                  <div className="grid md:grid-cols-2 gap-16">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Identification</label>
                      <input 
                        type="text" 
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        placeholder="FULL NAME"
                        className="w-full bg-transparent border-b border-white/10 py-6 focus:border-accent outline-none transition-colors font-black uppercase text-xl text-white"
                      />
                    </div>
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Communication</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="EMAIL ADDRESS"
                        className="w-full bg-transparent border-b border-white/10 py-6 focus:border-accent outline-none transition-colors font-black uppercase text-xl text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Objective</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-transparent border-b border-white/10 py-6 focus:border-accent outline-none transition-colors font-black uppercase text-xl text-white appearance-none"
                    >
                      <option className="bg-primary">Course Inquiry</option>
                      {COURSE_DATA.map(c => <option key={c.id} className="bg-primary">{c.title}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Message Payload</label>
                    <textarea 
                      rows={4} 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="DESCRIBE YOUR GOALS"
                      className="w-full bg-transparent border-b border-white/10 py-6 focus:border-accent outline-none transition-colors font-black uppercase text-xl text-white resize-none"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="group relative w-full py-10 bg-white text-primary text-xs font-black uppercase tracking-[0.6em] overflow-hidden transition-colors hover:text-white"
                  >
                    <span className="relative z-10">{status === 'loading' ? 'TRANSMITTING...' : 'INITIATE CONTACT'}</span>
                    <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </button>
                  
                  {status === 'success' && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent font-black text-center uppercase tracking-widest">Transmission Successful</motion.p>
                  )}
                  {status === 'error' && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-black text-center uppercase tracking-widest">Transmission Failed</motion.p>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-48 pb-20 overflow-hidden relative">
      {/* Background Accent */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-accent/5 -skew-y-6 translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-[1800px] mx-auto px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-24 mb-32">
          <div className="lg:col-span-4 space-y-12">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-16 h-16 bg-accent flex items-center justify-center text-white font-black text-3xl transition-transform group-hover:rotate-[135deg]">KB</div>
              <div className="flex flex-col">
                <span className="text-3xl font-black uppercase tracking-[-0.05em] text-white leading-none">KBIT</span>
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-accent leading-none mt-2">Academy</span>
              </div>
            </Link>
            <p className="text-2xl text-white/40 leading-tight font-medium max-w-sm">
              Empowering the next generation of IT architects with precision and global standards.
            </p>
            <div className="flex gap-8">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all duration-500">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-12">Navigation</h4>
            <ul className="space-y-6">
              {['Home', 'Courses', 'About', 'Contact'].map(item => (
                <li key={item}>
                  <Link 
                    to={item === 'Home' ? '/' : `/#${item.toLowerCase()}`} 
                    onClick={() => item === 'Home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : scrollToId(item.toLowerCase())}
                    className="text-lg font-bold text-white/60 hover:text-white transition-colors uppercase tracking-tighter"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-12">Specializations</h4>
            <ul className="space-y-6">
              {COURSE_DATA.map(course => (
                <li key={course.id}>
                  <Link to={`/course/${course.id}`} className="text-lg font-bold text-white/60 hover:text-white transition-colors uppercase tracking-tighter">
                    {course.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-12">Newsletter</h4>
            <p className="text-lg text-white/40 mb-8 font-medium leading-tight">Join our network for the latest in IT engineering.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-transparent border-b-2 border-white/10 py-6 focus:border-accent outline-none transition-colors font-black uppercase text-lg"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 text-accent group-hover:translate-x-2 transition-transform">
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
              © 2025 KBIT ACADEMY / ALL RIGHTS RESERVED
            </p>
            <div className="flex gap-12">
              <a href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-accent transition-colors">Privacy</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-accent transition-colors">Terms</a>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            DESIGNED BY KBIT / BUILT FOR EXPERTS
          </p>
        </div>
      </div>
    </footer>
  );
};
const CourseDetail = () => {
  const { id } = useParams();
  const course = COURSE_DATA.find(c => c.id === id);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!course) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h2 className="text-4xl font-black text-primary mb-8 uppercase tracking-tighter">Course not found</h2>
      <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 pb-48 bg-white"
    >
      <div className="max-w-[1800px] mx-auto px-12">
        <motion.button 
          onClick={() => navigate('/')}
          className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-24 group"
          whileHover={{ x: -10 }}
        >
          <ArrowLeft size={16} />
          <span>Return to Base</span>
        </motion.button>

        <div className="grid lg:grid-cols-12 gap-32">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-6 mb-12">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-accent px-4 py-1 border border-accent">
                  {course.tag}
                </span>
                <div className="w-16 h-[1px] bg-primary/10" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">
                  ID: {course.id.toUpperCase()}
                </span>
              </div>

              <h1 className="text-[8vw] lg:text-[120px] font-black text-primary uppercase tracking-[-0.05em] leading-[0.8] mb-16">
                {course.title.split(' ').map((word, i) => (
                  <span key={i} className={i === course.title.split(' ').length - 1 ? 'text-accent' : ''}>
                    {word} <br />
                  </span>
                ))}
              </h1>

              <div className="prose prose-2xl max-w-none mb-24">
                <p className="text-2xl text-primary/60 leading-relaxed font-medium italic">
                  {course.fullDescription}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-16 mb-32">
                <div className="bg-slate-50 p-12 border-l-4 border-primary">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-6">Technical Scope</h3>
                  <ul className="space-y-4">
                    {course.modules.map((module, i) => (
                      <li key={i} className="flex items-center gap-4 text-xl font-black text-primary uppercase tracking-tighter">
                        <div className="w-2 h-2 bg-accent" />
                        {module}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-primary p-12 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-[120px] font-black opacity-5 translate-x-1/4 -translate-y-1/4 select-none">
                    {course.duration[0]}
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">Mission Duration</h3>
                  <p className="text-6xl font-black tracking-tighter uppercase mb-4">{course.duration}</p>
                  <p className="text-xs font-medium text-white/60 tracking-widest uppercase">Intensive Training Protocol</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-40">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-primary p-12 lg:p-16 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Status</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Enrolling Now</span>
                  </div>

                  <div className="space-y-12 mb-16">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">Skill Level</p>
                      <p className="text-3xl font-black text-white uppercase tracking-tighter">{course.level}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">Certification</p>
                      <p className="text-3xl font-black text-white uppercase tracking-tighter">Industry Standard</p>
                    </div>
                  </div>

                  <Link 
                    to={`/enroll/${course.id}`}
                    className="group relative w-full py-10 bg-white text-primary text-xs font-black uppercase tracking-[0.6em] overflow-hidden transition-colors hover:text-white flex items-center justify-center gap-4"
                  >
                    <span className="relative z-10">Initiate Enrollment</span>
                    <ArrowRight size={16} className="relative z-10" />
                    <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>

                  <div className="mt-12 pt-12 border-t border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">Direct Support</p>
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-white">
                        <Phone size={20} />
                      </div>
                      <p className="text-xl font-black text-white tracking-tighter">+92 346 9307175</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const EnrollmentPage = () => {
  const { courseId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: courseId ? COURSE_DATA.find(c => c.id === courseId)?.title || 'MCSE Certification' : 'MCSE Certification',
    phone: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await addDoc(collection(db, 'enrollments'), {
        studentName: formData.name,
        studentEmail: formData.email,
        courseTitle: formData.course,
        phone: formData.phone,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full text-center"
        >
          <div className="w-32 h-32 bg-accent text-white flex items-center justify-center mx-auto mb-12 rounded-full">
            <CheckCircle2 size={64} />
          </div>
          <h2 className="text-6xl font-black text-primary uppercase tracking-tighter mb-8">Protocol Accepted</h2>
          <p className="text-xl text-primary/60 font-medium mb-12">Your enrollment data has been successfully transmitted. Our admissions unit will initiate contact within 24 hours.</p>
          <button onClick={() => navigate('/')} className="btn-primary px-16 py-6">Return to Base</button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-40 pb-48 bg-white"
    >
      <div className="max-w-[1800px] mx-auto px-12">
        <div className="grid lg:grid-cols-2 gap-32 items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-accent mb-8 block">Phase 01: Registration</span>
              <h1 className="text-[8vw] lg:text-[120px] font-black text-primary uppercase tracking-[-0.05em] leading-[0.8] mb-12">
                Initiate <br /> <span className="text-accent">Career</span> <br /> Pivot
              </h1>
              <p className="text-2xl text-primary/60 font-medium italic max-w-xl leading-relaxed">
                Secure your position in the next training cycle. Complete the identification protocol to begin.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-primary p-12 lg:p-20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
            
            <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-xl text-white font-black uppercase tracking-tighter focus:outline-none focus:border-accent transition-colors placeholder:text-white/5" 
                    placeholder="IDENTIFY_SUBJECT" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-xl text-white font-black uppercase tracking-tighter focus:outline-none focus:border-accent transition-colors placeholder:text-white/5" 
                    placeholder="COMM_CHANNEL" 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-xl text-white font-black uppercase tracking-tighter focus:outline-none focus:border-accent transition-colors placeholder:text-white/5" 
                    placeholder="+92_3XX_XXXXXXX" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Target Course</label>
                  <select 
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 text-xl text-white font-black uppercase tracking-tighter focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                  >
                    {COURSE_DATA.map(c => (
                      <option key={c.id} value={c.title} className="bg-primary text-white">{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                disabled={status === 'loading'}
                className="group relative w-full py-10 bg-white text-primary text-xs font-black uppercase tracking-[0.6em] overflow-hidden transition-colors hover:text-white flex items-center justify-center gap-4"
              >
                <span className="relative z-10">
                  {status === 'loading' ? 'Transmitting...' : 'Confirm Enrollment'}
                </span>
                {status === 'loading' ? <Loader2 className="animate-spin relative z-10" /> : <ArrowRight size={16} className="relative z-10" />}
                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
              
              {status === 'error' && (
                <p className="text-accent text-[10px] font-black uppercase tracking-[0.4em] text-center">Transmission Error. Retry Protocol Initiated.</p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'SYSTEM_READY: KBIT_AI_ADVISOR_v1.0. How can I assist your evolution today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initChat = () => {
    if (!chatRef.current) {
      const courseInfo = COURSE_DATA.map(c => 
        `${c.title} (${c.tag}): ${c.fullDescription}. Duration: ${c.duration}. Level: ${c.level}. Modules: ${c.modules.join(', ')}.`
      ).join('\n\n');

      chatRef.current = genAI.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are the KBIT_ADVISOR_v1.0. You are a high-tech, professional IT Career Advisor for KBIT Academy in Buner. 
          Your goal is to provide SHORT, CLEAR, and expert information based ONLY on KBIT's offerings.
          
          KBIT Academy Details:
          - Location: Buner, KP, Pakistan.
          - Contact: query@kbit.com.pk | +92 346 9307175
          
          Available Courses:
          ${courseInfo}
          
          Response Style:
          1. Use **Markdown**.
          2. Be concise. Use technical but accessible language.
          3. Format lists with bullets.
          4. If greeting, list the 4 main courses briefly.
          5. Encourage enrollment via the website form.`,
        },
      });
    }
    return chatRef.current;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const chat = initChat();
      const result = await chat.sendMessage({ message: userMessage });
      
      const botResponse = result.text || "SYSTEM ERROR: DATA STREAM INTERRUPTED.";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "CONNECTION_FAILED. RETRY_PROTOCOL_INITIATED." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-24 right-0 w-[90vw] md:w-[450px] h-[70vh] md:h-[600px] bg-primary border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* HUD Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-accent animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">KBIT_ADVISOR_v1.0</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Terminal View */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-8 font-mono relative"
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-50 z-10" />
              
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 ${
                    m.role === 'user' 
                      ? 'bg-accent text-white' 
                      : 'bg-white/5 text-white border border-white/10'
                  }`}>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                      {m.role === 'user' ? 'USER_INPUT' : 'ADVISOR_OUTPUT'}
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap markdown-content">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 border border-white/10 text-accent animate-pulse font-black text-xs tracking-widest">
                    PROCESSING_REQUEST...
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-black/40 border-t border-white/10">
              <div className="relative flex items-center">
                <span className="absolute left-4 text-accent font-mono">{">"}</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="ENTER COMMAND..."
                  className="w-full bg-white/5 border border-white/10 py-4 pl-10 pr-16 text-white font-mono text-sm focus:border-accent outline-none transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2 text-accent hover:text-white transition-colors disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 bg-primary text-white flex items-center justify-center shadow-2xl relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <div className="relative z-10">
          {isOpen ? <X size={32} /> : <MessageSquare size={32} />}
        </div>
        {!isOpen && (
          <div className="absolute inset-0 border-2 border-accent animate-ping opacity-50 rounded-none" />
        )}
      </motion.button>
    </div>
  );
};

const HomePage = () => {
  return (
    <>
      <Hero />
      <Stats />
      <Courses />
      <About />
      <Contact />
    </>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen relative overflow-x-hidden">
        <CustomCursor />
        <NoiseOverlay />
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/enroll" element={<EnrollmentPage />} />
          </Routes>
        </main>
        <Footer />
        <AIAssistant />
      </div>
    </Router>
  );
}

