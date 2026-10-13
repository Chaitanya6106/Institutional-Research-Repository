import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Search, FileText, Download, TrendingUp, Users, BookMarked, 
  Cpu, Zap, Cog, Building2, Brain, ChevronRight, Award, ExternalLink 
} from 'lucide-react';

const DEPARTMENTS_UI = [
  { name: 'Computer Science', icon: Cpu },
  { name: 'Electronics & Telecommunication', icon: Zap },
  { name: 'Mechanical Engineering', icon: Cog },
  { name: 'Civil Engineering', icon: Building2 },
  { name: 'Artificial Intelligence & ML', icon: Brain },
];

// File list mappings based on repository folders
const FOLDER_PAPERS = {
  'Artificial Intelligence & ML': [
    'A Review on Explainable Artificial',
    'Artificial Intelligence and Economi',
    'Artificial Intelligence Framework f',
    'Compression The Fermi Paradox and',
    'Creative Problem Solving in Artific',
    'Games for Artificial Intelligence R',
    'Modeling Belief in Dynamic Systems',
    'Study on the Helpfulness of Explain',
    'The Artificial Scientist Logicist',
    'Watershed of Artificial Intelligenc'
  ],
  'Computer Science': [
    'Building Bridges Establishing a Di',
    'Challenges for Inclusion in Softwar',
    'Challenges for Verifying and Valida',
    'Developers Perception of Peer Code',
    'Large Synoptic Survey Telescope Da',
    'Morescient GAI for Software Enginee',
    'Nmag micromagnetic simulation tool',
    'Pulsar Science with the SKA Observa',
    'The Present and Future of Bots in S',
    'Vision Based Game Development Using'
  ],
  'Mechanical Engineering': [
    'A Survey of Robot Manipulation in C',
    'Action Flow Matching for Continual',
    'Design of an Adaptive Lightweight L',
    'Influence of Operator Expertise on',
    'Malleable Robots',
    'Piezoelectric Soft Robot Inchworm M',
    'Safety Augmented Value Estimation f',
    'Secure and secret cooperation in ro',
    'Task segmentation based on transiti',
    'XiaomiRobotics1 Scaling VisionL'
  ],
  'Civil Engineering': [
    'Cracks in the Foundation A Civil I',
    'Digital Infrastructure in Astrophys',
    'Domain Adaptation in Structural Hea',
    'Eventbased Civil Infrastructure Vi',
    'Neural Extended Kalman Filters for',
    'Optimal design of frame structures',
    'Phase diagram in a onedimensional',
    'Resilience Evaluation Framework for',
    'State of the Art of Augmented Reali',
    'TwoScale Optimization of Graded La'
  ],
  'Electronics & Telecommunication': [
    'Accessbased Lightweight Physical L',
    'Cells in the Internet of Things',
    'Distributed Continuous RangeSkylin',
    'Domain Specific Modeling DSM as a',
    'Fine Time Measurement for the Inter',
    'Internet of Things An Overview',
    'Microlocation for Internet of Thin',
    'PrivacybyDesign Framework for Ass',
    'SenseDeliberateAct Cognitive Agen',
    'The Internet of Things Perspective'
  ]
};

// Exact publication year mapping per paper title/keyword
const EXACT_PAPER_YEARS = {
  // Civil & Structural Engineering Papers
  'cracks in the foundation': '2021',
  'digital infrastructure in astrophys': '2022',
  'domain adaptation in structural hea': '2023',
  'eventbased civil infrastructure vi': '2022',
  'neural extended kalman': '2023',
  'optimal design of frame structures': '2024',
  'phase diagram in a onedimensional': '2022',
  'resilience evaluation framework': '2023',
  'state of the art of augmented reali': '2020',
  'twoscale optimization': '2023',

  // Computer Science Papers
  'building bridges': '2022',
  'challenges for inclusion': '2021',
  'challenges for verifying': '2019',
  'developers perception of peer code': '2021',
  'large synoptic survey telescope': '2012',
  'morescient gai': '2024',
  'nmag micromagnetic': '2016',
  'pulsar science': '2025',
  'the present and future of bots': '2022',
  'vision based game development': '2010',

  // Artificial Intelligence & ML Papers
  'review on explainable artificial': '2023',
  'artificial intelligence and economi': '2022',
  'artificial intelligence framework f': '2024',
  'compression the fermi paradox': '2021',
  'creative problem solving': '2022',
  'games for artificial intelligence': '2020',
  'modeling belief in dynamic systems': '2023',
  'helpfulness of explain': '2023',
  'the artificial scientist logicist': '2022',
  'watershed of artificial intelligenc': '2024',

  // Electronics & Telecommunication Papers
  'accessbased lightweight': '2023',
  'cells in the internet of things': '2015',
  'distributed continuous rangeskylin': '2019',
  'domain specific modeling': '2020',
  'fine time measurement': '2022',
  'internet of things an overview': '2016',
  'microlocation for internet': '2017',
  'privacybydesign framework': '2017',
  'sensedeliberateact': '2020',
  'the internet of things perspective': '2016',

  // Mechanical & Robotics Papers
  'survey of robot manipulation': '2022',
  'action flow matching': '2025',
  'design of an adaptive lightweight': '2024',
  'influence of operator expertise': '2025',
  'malleable robots': '2025',
  'piezoelectric soft robot': '2023',
  'safety augmented value estimation': '2020',
  'secure and secret cooperation': '2021',
  'task segmentation based on transiti': '2023',
  'xiaomirobotics1': '2025'
};

// Keywords that return real results from your dataset
const TRENDING_KEYWORDS = [
  'Artificial Intelligence',
  'Robotics',
  'Internet of Things',
  'Structural',
  'Software Engineering',
  'Optimization'
];

// Rotating Featured Paper Pool (Changes on Page Refresh)
const FEATURED_POOL = [
  {
    id: 1,
    dept: 'Civil Engineering',
    title: 'Neural Extended Kalman Filters for Learning and Predicting Dynamics of Structural Systems',
    abstract: 'Integrates Extended Kalman Filtering with neural network formulations to model nonlinear structural dynamics under seismic and environmental perturbations.',
    authors: 'Wei Liu, Zhilu Lai, Kiran Bacsa, Eleni Chatzi'
  },
  {
    id: 12,
    dept: 'Computer Science',
    title: 'Morescient GAI for Software Engineering (Extended Version)',
    abstract: 'An augmented generative AI framework incorporating structural domain constraints to improve code synthesis fidelity and eliminate hallucinated dependencies.',
    authors: 'Marcus Kessel, Colin Atkinson'
  },
  {
    id: 21,
    dept: 'Electronics & Telecommunication',
    title: 'Fine Time Measurement for the Internet of Things: A Practical Approach Using ESP32',
    abstract: 'Demonstrates low-cost Wi-Fi Fine Time Measurement (FTM) hardware implementation on ESP32 nodes, enabling decimeter-level indoor positioning.',
    authors: 'Valentín Barral, Omar Campos, Tomás Domínguez-Bolaño, et al.'
  },
  {
    id: 36,
    dept: 'Mechanical Engineering',
    title: 'Xiaomi-Robotics-1: Scaling Vision-Language-Action Models with 100K Hours Trajectories',
    abstract: 'Presents a foundation Vision-Language-Action model trained on over 100,000 real-world robotic interaction trajectories for dexterous spatial manipulation.',
    authors: 'Xiaomi Robotics R&D Team'
  },
  {
    id: 7,
    dept: 'Artificial Intelligence & ML',
    title: 'A Review on Explainable Artificial Intelligence in Healthcare Applications',
    abstract: 'Surveys recent advancements in interpretable deep learning architectures and feature attribution methods for clinical diagnostic support systems.',
    authors: 'Academic AI & Health Research Group'
  }
];

const getPaperYear = (paper) => {
  const titleLower = (paper?.title || paper?.pdf_path || '').toLowerCase().trim();

  for (const [key, year] of Object.entries(EXACT_PAPER_YEARS)) {
    if (titleLower.includes(key)) {
      return year;
    }
  }

  if (paper?.publication_year && String(paper.publication_year).length === 4 && String(paper.publication_year) !== '2026') {
    return String(paper.publication_year);
  }

  return '2023';
};

const getDeptTag = (paper) => {
  const title = (paper?.title || paper?.pdf_path || '').toLowerCase();
  for (const [deptName, list] of Object.entries(FOLDER_PAPERS)) {
    if (list.some(item => title.includes(item.toLowerCase().trim()))) {
      return deptName;
    }
  }
  return paper?.departments?.department_name || 'Civil Engineering';
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [recentPapers, setRecentPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredPaper, setFeaturedPaper] = useState(FEATURED_POOL[0]);

  const navigate = useNavigate();

  useEffect(() => {
    // Pick a random featured paper every time the component loads
    const randomIndex = Math.floor(Math.random() * FEATURED_POOL.length);
    setFeaturedPaper(FEATURED_POOL[randomIndex]);

    fetchPapers();
  }, [selectedDepts]);

  const fetchPapers = async () => {
    try {
      setIsLoading(true);

      const { data: allPapers, error } = await supabase
        .from('research_papers')
        .select(`
          *,
          departments ( department_id, department_name )
        `);

      if (error) {
        console.error('Supabase fetch error:', error);
        setIsLoading(false);
        return;
      }

      if (!allPapers) {
        setRecentPapers([]);
        setIsLoading(false);
        return;
      }

      if (selectedDepts.length > 0) {
        let finalFiltered = [];

        selectedDepts.forEach(deptName => {
          const allowedTitles = FOLDER_PAPERS[deptName] || [];

          const deptPapers = allPapers.filter(paper => {
            const paperTitle = (paper.title || paper.pdf_path || '').toLowerCase().trim();
            return allowedTitles.some(allowed => 
              paperTitle.includes(allowed.toLowerCase().trim())
            );
          });

          finalFiltered.push(...deptPapers);
        });

        setRecentPapers(finalFiltered);
      } else {
        setRecentPapers(allPapers);
      }
    } catch (err) {
      console.error('Error fetching papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleDept = (deptName) => {
    setSelectedDepts(prev => 
      prev.includes(deptName) ? prev.filter(d => d !== deptName) : [...prev, deptName]
    );
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Header with High-Tech Network Overlay Background */}
      <section className="relative text-white py-20 px-4 text-center rounded-b-3xl shadow-xl overflow-hidden bg-slate-900">
        
        {/* Academic / Tech Network Background Image with Dark Masking */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-950" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
            Institutional Research Repository
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Discover, cite, and contribute to academic papers, student theses, and faculty publications.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto flex items-center pt-2">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, student, faculty, or key terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-4 rounded-xl bg-white text-slate-900 placeholder-slate-400 shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50 text-sm sm:text-base font-medium"
            />
            <button type="submit" className="absolute right-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-md">
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Department Filter Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Explore by Department</h2>
              {selectedDepts.length > 0 && (
                <button 
                  onClick={() => setSelectedDepts([])}
                  className="text-xs text-indigo-600 font-semibold hover:underline mt-1"
                >
                  Clear department filter ({selectedDepts.length} selected)
                </button>
              )}
            </div>
            <Link to="/search" className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {DEPARTMENTS_UI.map((dept) => {
              const Icon = dept.icon;
              const isSelected = selectedDepts.includes(dept.name);
              return (
                <button
                  key={dept.name}
                  onClick={() => toggleDept(dept.name)}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-32 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug">{dept.name}</h3>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Paper Sections Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: Research Spotlight & Quick Topics */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Quick Topic Chips */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Trending Keywords</span>
              </div>
              <p className="text-xs text-slate-500">
                Click any key term to quickly filter publications across departments:
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_KEYWORDS.map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(kw)}`)}
                    className="text-xs font-semibold bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200/80 transition"
                  >
                    #{kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Featured Research Paper Card */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-900/50 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> Featured Publication</span>
                <span className="bg-indigo-500/20 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {featuredPaper.dept}
                </span>
              </div>

              <h3 className="text-lg font-bold leading-snug text-white">
                {featuredPaper.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {featuredPaper.abstract}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">Authors: {featuredPaper.authors}</span>
                <Link
                  to={`/paper/${featuredPaper.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg transition"
                >
                  View Paper <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

          {/* RIGHT: Recent Publications / Filtered Results */}
          <div className="lg:col-span-6">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedDepts.length > 0 ? 'Filtered Publications' : 'Recent Publications'}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    {recentPapers.length} {recentPapers.length === 1 ? 'paper' : 'papers'}
                  </span>
                </div>
                
                <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto mt-2 pr-1">
                  {isLoading ? (
                    <p className="text-sm text-slate-500 py-4">Fetching papers from Supabase...</p>
                  ) : recentPapers.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">
                      No research papers found for the selected department.
                    </p>
                  ) : (
                    recentPapers.map((paper) => (
                      <div key={paper.paper_id || paper.id} className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50 px-2 rounded-lg transition">
                        <div className="space-y-1">
                          <Link to={`/paper/${paper.paper_id || paper.id}`} className="font-medium text-slate-900 hover:text-indigo-600 line-clamp-1 text-sm">
                            📄 {paper.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-indigo-600 font-medium">
                              {getDeptTag(paper)}
                            </span>
                            <span>•</span>
                            <span>Year: {getPaperYear(paper)}</span>
                          </div>
                        </div>
                        <Link to={`/paper/${paper.paper_id || paper.id}`} className="text-xs font-semibold text-indigo-600 hover:underline shrink-0">
                          View
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link
                to="/search"
                className="w-full text-center py-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 transition block mt-4"
              >
                Browse All 50 Repository Papers →
              </Link>
            </section>
          </div>

        </div>

        {/* Global Statistics Banner */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-center text-slate-100">Repository Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <FileText className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold">{recentPapers.length > 0 ? 50 : 0}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Total Papers</div>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <Users className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold">18</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Faculty Advisors</div>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <BookMarked className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold">42</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Student Authors</div>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <Download className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold">1,240+</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Total Downloads</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}