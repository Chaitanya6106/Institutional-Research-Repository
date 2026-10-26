import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search as SearchIcon, Filter, RotateCcw, FileText, Loader2 } from 'lucide-react';

const DEPARTMENTS_OPTIONS = [
  'All Departments',
  'Computer Science',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & ML'
];

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

// Comprehensive lookup dictionary mapping exact titles and keywords to their exact publication year
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

const getPaperYear = (paper) => {
  const titleLower = (paper?.title || paper?.pdf_path || '').toLowerCase().trim();

  // Match title against the exact year mapping
  for (const [key, year] of Object.entries(EXACT_PAPER_YEARS)) {
    if (titleLower.includes(key)) {
      return year;
    }
  }

  // Fallback to valid 4-digit database publication year if present and not 2026
  if (paper?.publication_year && String(paper.publication_year).length === 4 && String(paper.publication_year) !== '2026') {
    return String(paper.publication_year);
  }

  // Default fallback year
  return '2023';
};

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [titleQuery, setTitleQuery] = useState(initialQuery);
  const [studentQuery, setStudentQuery] = useState('');
  const [facultyQuery, setFacultyQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedType, setSelectedType] = useState('All Types');

  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPapers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [titleQuery, studentQuery, facultyQuery, selectedDept, selectedYear, selectedType, papers]);

  async function fetchAllPapers() {
    try {
      setLoading(true);

      // Load the repository's existing papers and newly approved student submissions.
      const [repositoryResult, submissionsResult] = await Promise.all([
        supabase
          .from('research_papers')
          .select(`*, departments ( department_id, department_name )`),
        supabase
          .from('paper_submissions')
          .select('id, title, faculty_guide, abstract, pdf_path, status, feedback, created_at')
          .eq('status', 'Approved')
          .order('created_at', { ascending: false })
      ]);

      if (repositoryResult.error) {
        console.error('Error fetching existing research papers:', repositoryResult.error);
      }
      if (submissionsResult.error) {
        console.error('Error fetching approved submissions:', submissionsResult.error);
      }

      const repositoryPapers = (repositoryResult.data || []).map((paper) => ({
        ...paper,
        _source: 'repository'
      }));

      // Convert submissions to the same shape used by the existing search UI.
      const approvedSubmissions = (submissionsResult.data || []).map((submission) => ({
        ...submission,
        paper_id: submission.id,
        guide_name: submission.faculty_guide || '',
        author_name: submission.author_name || '',
        publication_year: submission.publication_year || null,
        _source: 'submission'
      }));

      // Avoid duplicate cards if a paper has also been manually added to research_papers.
      const existingTitles = new Set(
        repositoryPapers.map((paper) => (paper.title || '').trim().toLowerCase())
      );
      const uniqueSubmissions = approvedSubmissions.filter(
        (paper) => !existingTitles.has((paper.title || '').trim().toLowerCase())
      );

      setPapers([...uniqueSubmissions, ...repositoryPapers]);
    } catch (err) {
      console.error('Error fetching papers in Search:', err);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  }

  async function openSubmissionDocument(paper) {
    if (!paper?.pdf_path) {
      console.error('This submission does not have a PDF path.');
      window.alert('The document path is not available for this paper.');
      return;
    }

    try {
      // pdf_path is the object path inside the private Supabase Storage bucket named Papers.
      const { data, error } = await supabase.storage
        .from('Papers')
        .createSignedUrl(paper.pdf_path, 60 * 5);

      if (error) throw error;
      if (!data?.signedUrl) throw new Error('Supabase did not return a document URL.');

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Could not open approved paper:', err);
      window.alert(`Could not open the document: ${err.message || 'Unknown error'}`);
    }
  }

  function applyFilters() {
    let result = [...papers];

    // 1. Department Filter using folder mapping
    if (selectedDept !== 'All Departments') {
      const allowedTitles = FOLDER_PAPERS[selectedDept] || [];
      result = result.filter(paper => {
        const paperTitle = (paper.title || paper.pdf_path || '').toLowerCase().trim();
        return allowedTitles.some(allowed => paperTitle.includes(allowed.toLowerCase().trim()));
      });
    }

    // 2. Paper Title Search
    if (titleQuery.trim()) {
      const q = titleQuery.toLowerCase();
      result = result.filter(p => (p.title || '').toLowerCase().includes(q));
    }

    // 3. Student/Author Search
    if (studentQuery.trim()) {
      const q = studentQuery.toLowerCase();
      result = result.filter(p =>
        (p.author_name || '').toLowerCase().includes(q) ||
        (p.student_name || '').toLowerCase().includes(q)
      );
    }

    // 4. Faculty/Guide Search
    if (facultyQuery.trim()) {
      const q = facultyQuery.toLowerCase();
      result = result.filter(p =>
        (p.guide_name || p.faculty_guide || '').toLowerCase().includes(q)
      );
    }

    // 5. Year Filter
    if (selectedYear !== 'All Years') {
      result = result.filter(p => getPaperYear(p) === selectedYear);
    }

    setFilteredPapers(result);
  }

  const handleReset = () => {
    setTitleQuery('');
    setStudentQuery('');
    setFacultyQuery('');
    setSelectedDept('All Departments');
    setSelectedYear('All Years');
    setSelectedType('All Types');
  };

  // Helper to determine display department tag on cards
  const getDeptTag = (paper) => {
    const title = (paper.title || '').toLowerCase();
    for (const [deptName, list] of Object.entries(FOLDER_PAPERS)) {
      if (list.some(item => title.includes(item.toLowerCase().trim()))) {
        return deptName;
      }
    }
    return paper.departments?.department_name || 'Civil Engineering';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <SearchIcon className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Repository Search</h1>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 items-start">

        {/* Left Sidebar Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Search Filters</span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Paper Title</label>
            <input
              type="text"
              placeholder="e.g. Smart Parking"
              value={titleQuery}
              onChange={(e) => setTitleQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Student Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Student Name</label>
            <input
              type="text"
              placeholder="e.g. Alex"
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Faculty Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Faculty Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. Kulkarni"
              value={facultyQuery}
              onChange={(e) => setFacultyQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Department Select Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-800"
            >
              {DEPARTMENTS_OPTIONS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Year Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All Years">All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2017">2017</option>
              <option value="2016">2016</option>
              <option value="2015">2015</option>
              <option value="2012">2012</option>
              <option value="2010">2010</option>
            </select>
          </div>
        </div>

        {/* Right Search Results Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span>Showing results matching selected criteria</span>
            <span className="font-bold text-slate-900">{filteredPapers.length} Papers Found</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-2">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Searching repository...</p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">No papers found</h3>
              <p className="text-xs text-slate-500">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPapers.map((paper, idx) => (
                <div key={paper._source === 'submission' ? `submission-${paper.id}` : (paper.paper_id || paper.id || idx)} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-300 transition space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-50 text-indigo-700 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {getDeptTag(paper)}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Published {getPaperYear(paper)}
                    </span>
                  </div>

                  {paper._source === 'submission' ? (
                    <button
                      type="button"
                      onClick={() => openSubmissionDocument(paper)}
                      className="block text-left group"
                    >
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                        #{paper.paper_id || idx + 1}. {paper.title}
                      </h2>
                      <span className="mt-1 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                        View approved document
                      </span>
                    </button>
                  ) : (
                    <Link to={`/paper/${paper.paper_id || paper.id}`} className="block group">
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                        #{paper.paper_id || idx + 1}. {paper.title}
                      </h2>
                    </Link>
                  )}

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {paper.abstract || `A research study on ${paper.title?.toLowerCase() || 'this topic'} conducted under the institutional research program.`}
                  </p>

                  <div className="flex items-center justify-between pt-2 text-xs text-slate-400 border-t border-slate-50">
                    <span>Paper ID: #{paper.paper_id || paper.id} • Status: Approved</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}