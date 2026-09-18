import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Search, 
  MessageSquare, 
  ThumbsUp, 
  Bookmark, 
  Share2, 
  Plus, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Filter, 
  X,
  Clock,
  User,
  Image as ImageIcon,
  Check
} from "lucide-react";
import { Blog, BlogComment } from "../types";

interface BlogsViewProps {
  blogs: Blog[];
  onAddBlog: (newBlog: Blog) => void;
  onUpdateBlog: (updatedBlog: Blog) => void;
  onDeleteBlog: (id: string) => void;
  currentUserEmail: string;
}

// A curated set of startup categories matching filters
const CATEGORIES = [
  "All",
  "AI",
  "Startups",
  "SaaS",
  "Marketing",
  "Technology",
  "Funding",
  "Business",
  "Social Networking",
  "Hackathons",
  "Innovation",
  "College Startups",
  "Trending",
  "Latest",
  "Bookmarked"
];

const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80"
];

export default function BlogsView({
  blogs,
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
  currentUserEmail
}: BlogsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeBlogId, setActiveBlogId] = useState<string | null>(null);

  // Modal / Form state for publishing or editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("AI");
  const [formCoverImage, setFormCoverImage] = useState(PRESET_COVERS[0]);
  const [formAuthorName, setFormAuthorName] = useState("Student Founder");
  const [formAuthorRole, setFormAuthorRole] = useState("Co-founder, NextGen Labs");
  
  // Comment entry state
  const [commentText, setCommentText] = useState("");
  const [shareSuccessId, setShareSuccessId] = useState<string | null>(null);

  // Filter strategy
  const filteredBlogs = blogs.filter((blog) => {
    // 1. Title/Content/Author search
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // 2. Category selection
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Latest") {
      // Sort is handled inside renderer, return all
      return true;
    }
    if (selectedCategory === "Trending") {
      return blog.likes > 100;
    }
    if (selectedCategory === "Bookmarked") {
      return !!blog.bookmarkedByCurrentUser;
    }

    return blog.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Sort if Latest is picked
  const finalizeBlogs = selectedCategory === "Latest" 
    ? [...filteredBlogs].sort((a, b) => b.date.localeCompare(a.date)) 
    : filteredBlogs;

  const openPublishModal = (blogToEdit?: Blog) => {
    if (blogToEdit) {
      setEditingBlog(blogToEdit);
      setFormTitle(blogToEdit.title);
      setFormContent(blogToEdit.content);
      setFormCategory(blogToEdit.category);
      setFormCoverImage(blogToEdit.coverImage);
      setFormAuthorName(blogToEdit.authorName);
      setFormAuthorRole(blogToEdit.authorRole);
    } else {
      setEditingBlog(null);
      setFormTitle("");
      setFormContent("");
      setFormCategory("AI");
      setFormCoverImage(PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)]);
      setFormAuthorName(currentUserEmail ? currentUserEmail.split("@")[0] : "Student Founder");
      setFormAuthorRole("Founder, Venture Node Member");
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const readTimeCalc = Math.max(1, Math.ceil(formContent.split(/\s+/).length / 200));

    if (editingBlog) {
      const updated: Blog = {
        ...editingBlog,
        title: formTitle,
        content: formContent,
        category: formCategory,
        coverImage: formCoverImage,
        authorName: formAuthorName,
        authorRole: formAuthorRole,
        readingTime: readTimeCalc
      };
      onUpdateBlog(updated);
    } else {
      const newBlog: Blog = {
        id: `blog-${Date.now()}`,
        title: formTitle,
        content: formContent,
        category: formCategory,
        coverImage: formCoverImage,
        authorName: formAuthorName,
        authorRole: formAuthorRole,
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        likes: 0,
        likedByCurrentUser: false,
        comments: [],
        bookmarkedByCurrentUser: false,
        readingTime: readTimeCalc,
        date: new Date().toISOString().split("T")[0]
      };
      onAddBlog(newBlog);
    }
    setIsModalOpen(false);
  };

  const handleLike = (blog: Blog, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: Blog = {
      ...blog,
      likedByCurrentUser: !blog.likedByCurrentUser,
      likes: blog.likedByCurrentUser ? blog.likes - 1 : blog.likes + 1
    };
    onUpdateBlog(updated);
  };

  const handleBookmark = (blog: Blog, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: Blog = {
      ...blog,
      bookmarkedByCurrentUser: !blog.bookmarkedByCurrentUser
    };
    onUpdateBlog(updated);
  };

  const handleShare = (blog: Blog, e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate share workflow
    setShareSuccessId(blog.id);
    setTimeout(() => {
      setShareSuccessId(null);
    }, 2000);
  };

  const submitComment = (blog: Blog) => {
    if (!commentText.trim()) return;
    const authorName = currentUserEmail ? currentUserEmail.split("@")[0] : "Founder Student";
    const newComment: BlogComment = {
      id: `c-${Date.now()}`,
      author: authorName,
      content: commentText,
      date: new Date().toISOString().split("T")[0]
    };
    const updated: Blog = {
      ...blog,
      comments: [...blog.comments, newComment]
    };
    onUpdateBlog(updated);
    setCommentText("");
  };

  const activeBlogObj = blogs.find(b => b.id === activeBlogId);

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-205 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search blogs by title, substance or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
            id="blog-search-input"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openPublishModal()}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
            id="btn-publish-blog pointer-events-none"
          >
            <Plus className="w-4 h-4" />
            Publish Article
          </button>
        </div>
      </div>

      {/* Categories Scroller Tab bars */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 border ${
              selectedCategory === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main View Grid split: Feed vs Active blog drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left pane: Feed */}
        <div className={`space-y-6 ${activeBlogId ? "lg:col-span-6" : "lg:col-span-12"}`}>
          {finalizeBlogs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-display font-medium text-slate-900 text-lg">No Articles Found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                No articles matches under category "{selectedCategory}" or search term "{searchTerm}".
              </p>
              <button 
                onClick={() => { setSelectedCategory("All"); setSearchTerm(""); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-medium rounded-lg transition-all text-blue-600 cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${activeBlogId ? "md:grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"} gap-6`}>
              {finalizeBlogs.map((blog) => (
                <div
                  key={blog.id}
                  onClick={() => setActiveBlogId(blog.id === activeBlogId ? null : blog.id)}
                  className={`bg-white rounded-xl border overflow-hidden flex flex-col justify-between hover:shadow-md transition-all cursor-pointer duration-300 group ${
                    activeBlogId === blog.id ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"
                  }`}
                  id={`blog-card-${blog.id}`}
                >
                  <div>
                    {/* Cover image thumbnail */}
                    <div className="h-44 overflow-hidden relative bg-slate-900">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-mono tracking-wider bg-slate-900/90 text-white rounded backdrop-blur">
                        {blog.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <img 
                          src={blog.authorAvatar} 
                          alt={blog.authorName} 
                          className="w-6 h-6 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-[11px] font-medium text-slate-900 leading-none">{blog.authorName}</div>
                          <span className="text-[9px] text-slate-400 font-mono">{blog.date}</span>
                        </div>
                      </div>

                      <h3 className="font-display font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-base leading-tight">
                        {blog.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {blog.content.replace(/#+\s/g, "")}
                      </p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50">
                    <div className="flex items-center gap-3 text-slate-500">
                      <button 
                        onClick={(e) => handleLike(blog, e)}
                        className={`flex items-center gap-1 group/btn hover:text-blue-600 cursor-pointer ${
                          blog.likedByCurrentUser ? "text-blue-600 font-medium" : ""
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${blog.likedByCurrentUser ? "fill-blue-500 text-blue-600" : ""}`} />
                        <span>{blog.likes}</span>
                      </button>
                      
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{blog.comments.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleBookmark(blog, e)}
                        className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer ${
                          blog.bookmarkedByCurrentUser ? "text-amber-500" : "text-slate-400"
                        }`}
                        title="Bookmark"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${blog.bookmarkedByCurrentUser ? "fill-amber-500 text-amber-500" : ""}`} />
                      </button>

                      <button 
                        onClick={(e) => handleShare(blog, e)}
                        className={`p-1.5 rounded hover:bg-slate-200 cursor-pointer text-slate-400`}
                        title="Share"
                      >
                        {shareSuccessId === blog.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Display Delete / Edit if it is a simulated blog by this email */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); openPublishModal(blog); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-200 rounded cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteBlog(blog.id); }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200 rounded cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right pane: Selected Article Panel */}
        {activeBlogId && activeBlogObj && (
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden sticky top-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-semibold text-slate-600">Enterprise Reader</span>
              <button 
                onClick={() => setActiveBlogId(null)}
                className="p-1 hover:bg-slate-200 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-64 relative bg-slate-900">
              <img 
                src={activeBlogObj.coverImage} 
                alt={activeBlogObj.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-4 left-4 bg-slate-900/90 hover:bg-slate-900 text-white px-3 py-1 text-xs font-mono rounded">
                Category: {activeBlogObj.category}
              </span>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Author & Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={activeBlogObj.authorAvatar} 
                    alt={activeBlogObj.authorName} 
                    className="w-10 h-10 rounded-full object-cover border"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">{activeBlogObj.authorName}</h4>
                    <p className="text-[11px] text-slate-500 leading-none">{activeBlogObj.authorRole}</p>
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div className="flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{activeBlogObj.readingTime} min read</span>
                  </div>
                  <div>Published: {activeBlogObj.date}</div>
                </div>
              </div>

              {/* Title & Body */}
              <div className="space-y-4">
                <h1 className="text-xl md:text-2xl font-display font-semibold text-slate-900 leading-tight">
                  {activeBlogObj.title}
                </h1>
                
                {/* Content rendering */}
                <div className="text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line border-b border-slate-100 pb-6">
                  {activeBlogObj.content}
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="font-display font-medium text-slate-950 text-sm">
                  Discussion Subspace ({activeBlogObj.comments.length})
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {activeBlogObj.comments.map((comment) => (
                    <div key={comment.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-semibold text-slate-700">@{comment.author}</span>
                        <span className="text-slate-400">{comment.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-normal">{comment.content}</p>
                    </div>
                  ))}

                  {activeBlogObj.comments.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No nodes responded yet. Initiate the feedback thread.</p>
                  )}
                </div>

                {/* Post comment form */}
                <div className="flex gap-2 pt-2">
                  <input 
                    type="text" 
                    placeholder="Contribute analytical feedback..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                    onKeyDown={(e) => { if (e.key === 'Enter') submitComment(activeBlogObj); }}
                  />
                  <button 
                    onClick={() => submitComment(activeBlogObj)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs hover:bg-slate-850 cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* PUBLISH & EDIT MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-202 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-display font-medium text-slate-900">
                {editingBlog ? "Edit Enterprise Article" : "Publish to Knowledge Hub"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-500 uppercase">Article Title</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Surviving the Chasm: Building Moats in Micro-SaaS"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-slate-500 uppercase">Primary Category focus</label>
                  <select 
                    value={formCategory} 
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    {CATEGORIES.slice(1, -3).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-slate-500 uppercase">Author Name label</label>
                  <input 
                    type="text" 
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-500 uppercase">Author Designation / Role</label>
                <input 
                  type="text" 
                  value={formAuthorRole}
                  onChange={(e) => setFormAuthorRole(e.target.value)}
                  placeholder="e.g., Co-founder, AeroScribe AI"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Cover presets selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-slate-500 uppercase block">Select Article Cover Preset</label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COVERS.map((cov) => (
                    <button
                      key={cov}
                      type="button"
                      onClick={() => setFormCoverImage(cov)}
                      className={`h-12 rounded-lg overflow-hidden border-2 relative cursor-pointer ${
                        formCoverImage === cov ? "border-blue-600" : "border-transparent"
                      }`}
                    >
                      <img src={cov} alt="Preset visual" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-500 uppercase block">Substance & Markdown Article Body</label>
                <textarea 
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={8}
                  placeholder="Write clear, descriptive analytical research metrics or founder plans..."
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs cursor-pointer"
                >
                  {editingBlog ? "Save Changes" : "Publish Now"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
