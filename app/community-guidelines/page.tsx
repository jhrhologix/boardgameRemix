import Header from "@/components/header"
import Footer from "@/components/footer"
import { Shield, Users, MessageSquare, ThumbsUp, AlertTriangle, BookOpen, Target, Award, Lightbulb, CheckCircle, XCircle, ExternalLink } from "lucide-react"

export default function CommunityGuidelinesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FF6B35] mb-6">
              remix.games Community Guidelines & Rules
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              <em>Building the world's most creative board gaming community</em>
            </p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mt-4">
              remix.games is the premier platform for <strong>creative board game combinations</strong> and <strong>innovative game variants</strong>. Our mission is to help board game enthusiasts discover new ways to enjoy their existing collections through <strong>community-driven game remixes</strong> and <strong>creative tabletop modifications</strong>.
            </p>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-[#FF6B35] mb-8 text-center">Core Community Values</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-black p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Target className="h-8 w-8 text-[#FF6B35] mr-3" />
                    <h3 className="text-xl font-bold text-white">🎯 Creativity First</h3>
                  </div>
                  <p className="text-gray-300">
                    We celebrate <strong>innovative board game modifications</strong> and <strong>unique game combinations</strong> that breathe new life into your collection. Every remix should offer a genuinely fresh gaming experience.
                  </p>
                </div>

                <div className="bg-black p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Users className="h-8 w-8 text-[#FF6B35] mr-3" />
                    <h3 className="text-xl font-bold text-white">🤝 Community Driven</h3>
                  </div>
                  <p className="text-gray-300">
                    Our <strong>board game remix community</strong> thrives on collaboration, constructive feedback, and shared passion for <strong>creative gaming</strong>. We support both new and experienced <strong>game inventors</strong> and <strong>tabletop innovators</strong>.
                  </p>
                </div>

                <div className="bg-black p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Award className="h-8 w-8 text-[#FF6B35] mr-3" />
                    <h3 className="text-xl font-bold text-white">🔍 Quality Standards</h3>
                  </div>
                  <p className="text-gray-300">
                    All <strong>game variants</strong> and <strong>custom rules</strong> must be thoroughly tested, clearly explained, and designed for real gameplay. We maintain <strong>BoardGameGeek-quality standards</strong> for all community contributions.
                  </p>
                </div>

                <div className="bg-black p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <BookOpen className="h-8 w-8 text-[#FF6B35] mr-3" />
                    <h3 className="text-xl font-bold text-white">📚 Educational Value</h3>
                  </div>
                  <p className="text-gray-300">
                    We encourage <strong>game modifications</strong> that teach new strategies, introduce interesting mechanics, or provide deeper gaming experiences while respecting the original games' design integrity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Submission Guidelines */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-[#FF6B35] mb-8 text-center">Content Submission Guidelines</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* What We Want */}
                <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-400 mr-3" />
                    <h3 className="text-xl font-bold text-white">✅ What We Want to See</h3>
                  </div>
                  
                  <div className="space-y-4 text-gray-300">
                    <div>
                      <h4 className="font-bold text-white mb-2">High-Quality Game Remixes:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li><strong>Complete rule sets</strong> with clear setup instructions and gameplay mechanics</li>
                        <li><strong>Detailed component lists</strong> specifying exactly which pieces from each board game are needed</li>
                        <li><strong>Tested combinations</strong> that have been playtested with real gaming groups</li>
                        <li><strong>Creative game variants</strong> that meaningfully combine different games' mechanics</li>
                        <li><strong>Educational gaming content</strong> that adds strategic depth or learning value</li>
                        <li><strong>Family-friendly adaptations</strong> that make complex games accessible to more players</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Professional Presentation:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li><strong>Clear writing</strong> with proper grammar and organized structure</li>
                        <li><strong>Accurate game information</strong> verified against BoardGameGeek and official sources</li>
                        <li><strong>Honest playtime estimates</strong> and complexity ratings based on actual testing</li>
                        <li><strong>Constructive tone</strong> focused on gameplay experience and player enjoyment</li>
                        <li><strong>Visual aids</strong> including setup photos, component layouts, or reference cards when helpful</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* What We Don't Allow */}
                <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <XCircle className="h-8 w-8 text-red-400 mr-3" />
                    <h3 className="text-xl font-bold text-white">❌ What We Don't Allow</h3>
                  </div>
                  
                  <div className="space-y-4 text-gray-300">
                    <div>
                      <h4 className="font-bold text-white mb-2">Promotional Content & Spam:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li><strong>Self-promotion</strong> disguised as game remixes (including Kickstarter campaigns, product launches, or business promotion)</li>
                        <li><strong>Hidden advertising</strong> with embedded URLs, affiliate links, or promotional language</li>
                        <li><strong>Fake remixes</strong> designed primarily to mention or promote specific games, publishers, or designers</li>
                        <li><strong>Mass submissions</strong> of low-quality content designed to drive traffic elsewhere</li>
                        <li><strong>Contact harvesting</strong> including email addresses, social media handles, or business contact information</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Low-Quality Submissions:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li><strong>Incomplete rule sets</strong> missing key gameplay mechanics, setup instructions, or victory conditions</li>
                        <li><strong>Untested combinations</strong> that clearly haven't been played or refined</li>
                        <li><strong>Broken mechanics</strong> that create impossible situations or unwinnable scenarios</li>
                        <li><strong>Plagiarized content</strong> copied from other sources without attribution or modification</li>
                        <li><strong>Minimal effort posts</strong> with vague descriptions like "combine these games somehow"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BoardGameGeek Integration */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#FF6B35] mb-8 text-center">BoardGameGeek Integration & Compliance</h2>
              
              <div className="bg-black p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <ExternalLink className="h-8 w-8 text-[#FF6B35] mr-3" />
                  <h3 className="text-xl font-bold text-white">📋 Official Game Data Standards</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  remix.games maintains <strong>BoardGameGeek-compatible standards</strong> for all game information and references. We use <strong>BGG's comprehensive game database</strong> to ensure accuracy and provide seamless integration with the broader board gaming community.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-3">Required Attribution:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                      <li>All <strong>board game</strong> references must link to official <strong>BoardGameGeek</strong> entries when available</li>
                      <li><strong>Publisher and designer credits</strong> must be accurate and up-to-date per BGG standards</li>
                      <li><strong>Component specifications</strong> must match official game inventories as documented on BoardGameGeek</li>
                      <li><strong>Community integration</strong> includes cross-referencing with BGG's game variants and rule modifications when relevant</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-white mb-3">Quality Verification:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                      <li><strong>Game authenticity</strong> verified against BoardGameGeek's comprehensive database</li>
                      <li><strong>Community standards</strong> aligned with BGG's reputation for accuracy and thoroughness</li>
                      <li><strong>Collaborative improvement</strong> encouraging community members to suggest corrections and improvements</li>
                      <li><strong>Professional presentation</strong> maintaining standards worthy of the broader board gaming community</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI & Technology Policy */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#FF6B35] mb-8 text-center">AI & Technology-Assisted Content Policy</h2>
              
              <div className="bg-black p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-8 w-8 text-[#FF6B35] mr-3" />
                  <h3 className="text-xl font-bold text-white">🤖 AI-Assisted Creation Guidelines</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  remix.games welcomes <strong>innovative game design tools</strong> and <strong>AI-assisted creativity</strong> when used to enhance rather than replace human insight and testing.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-3">Acceptable AI Use:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                      <li><strong>Rule refinement</strong> using AI tools to improve clarity and organization of human-created content</li>
                      <li><strong>Brainstorming assistance</strong> for generating initial concepts that are then developed and tested by humans</li>
                      <li><strong>Quality enhancement</strong> for grammar, structure, and presentation of original game ideas</li>
                      <li><strong>Research support</strong> for understanding game mechanics and compatibility</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-white mb-3">Required Disclosure:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                      <li><strong>Transparency required:</strong> Clearly indicate when AI tools were used in content creation</li>
                      <li><strong>Human verification:</strong> All AI-assisted content must include evidence of human playtesting and refinement</li>
                      <li><strong>Quality standards:</strong> AI-assisted content must meet the same high standards as purely human-created remixes</li>
                      <li><strong>Community value:</strong> Focus must remain on creating valuable gaming experiences, not just generating content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Interaction Standards */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#FF6B35] mb-8 text-center">Community Interaction Standards</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <ThumbsUp className="h-8 w-8 text-green-400 mr-3" />
                    <h3 className="text-xl font-bold text-white">💬 Encouraged Behavior</h3>
                  </div>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300 text-sm">
                    <li><strong>Helpful feedback</strong> on game balance, clarity, and playability</li>
                    <li><strong>Constructive suggestions</strong> for improving remixes and variants</li>
                    <li><strong>Sharing experiences</strong> from playtesting remixes with your gaming groups</li>
                    <li><strong>Collaborative improvement</strong> working with remix creators to refine their ideas</li>
                    <li><strong>Knowledge sharing</strong> about game mechanics, strategies, and compatibility insights</li>
                    <li><strong>Newcomer assistance</strong> helping new community members understand remix creation and submission</li>
                  </ul>
                </div>

                <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-400 mr-3" />
                    <h3 className="text-xl font-bold text-white">🚫 Unacceptable Behavior</h3>
                  </div>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300 text-sm">
                    <li><strong>Personal attacks</strong> or harassment of community members or content creators</li>
                    <li><strong>Spam flagging</strong> content for inappropriate or non-constructive reasons</li>
                    <li><strong>Plagiarism</strong> claiming others' work or ideas as your own</li>
                    <li><strong>Disruption</strong> of constructive community discussions or feedback processes</li>
                    <li><strong>Off-topic promotion</strong> of unrelated products, services, or communities</li>
                    <li><strong>Mass generation</strong> of untested, low-quality remix content using AI</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Moderation */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#FF6B35] mb-8 text-center">Content Moderation & Review Process</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-black p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4">🔍 Automated Quality Screening</h3>
                  <p className="text-gray-300 mb-4">
                    remix.games uses <strong>advanced content analysis</strong> to ensure submission quality and detect potential spam or promotional content.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                    <li><strong>Completeness verification</strong> ensuring all required sections and information are included</li>
                    <li><strong>Game authenticity checks</strong> against BoardGameGeek database and official sources</li>
                    <li><strong>Balance analysis</strong> identifying potential gameplay issues or impossible scenarios</li>
                    <li><strong>Promotional language detection</strong> identifying commercial or self-promotional content</li>
                    <li><strong>Pattern recognition</strong> detecting mass submissions or duplicate content across accounts</li>
                  </ul>
                </div>

                <div className="bg-black p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4">👥 Community Review Process</h3>
                  <p className="text-gray-300 mb-4">
                    High-quality submissions that pass automated screening are promoted to community review for feedback and refinement.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                    <li><strong>Community testing</strong> by experienced board gamers and remix creators</li>
                    <li><strong>Feedback incorporation</strong> helping creators refine and improve their submissions</li>
                    <li><strong>Quality assurance</strong> ensuring published remixes meet community standards</li>
                    <li><strong>Recognition system</strong> highlighting exceptional contributions and helpful community members</li>
                    <li><strong>Continuous improvement</strong> based on gameplay reports and community suggestions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-[#FF6B35] mb-8">Getting Started</h2>
              
              <div className="bg-black p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-4">🚀 New Creator Checklist</h3>
                
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="font-bold text-white mb-3">Before Submitting Your First Remix:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                      <li><strong>Study successful examples</strong> from our featured and community-choice remixes</li>
                      <li><strong>Playtest thoroughly</strong> with multiple gaming groups to refine balance and clarity</li>
                      <li><strong>Document completely</strong> including all setup, gameplay, and component requirements</li>
                      <li><strong>Verify game information</strong> against BoardGameGeek to ensure accuracy</li>
                      <li><strong>Review guidelines</strong> to ensure your submission meets all quality and community standards</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-white mb-3">Submission Best Practices:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                      <li><strong>Start with familiar games</strong> you know well and have played extensively</li>
                      <li><strong>Focus on one combination</strong> rather than trying to remix multiple games simultaneously</li>
                      <li><strong>Include clear photos</strong> of setup, components, or key gameplay moments when helpful</li>
                      <li><strong>Write for new players</strong> assuming readers may not be familiar with all games involved</li>
                      <li><strong>Engage with feedback</strong> and be responsive to community questions and suggestions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Info */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Ready to Share Your Creative Game Ideas?</h2>
              <p className="text-gray-300 mb-6">
                Join our growing community of <strong>board game innovators</strong> and <strong>creative gaming enthusiasts</strong>!
              </p>
              <div className="bg-black p-6 rounded-lg">
                <p className="text-sm text-gray-400">
                  <strong>Current Version:</strong> 1.0 | <strong>Last Updated:</strong> September 2025 | <strong>Next Review:</strong> December 2025
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  These guidelines evolve based on community feedback and the growing <strong>board game remix community</strong>. We regularly review and update our policies to better serve creators and maintain the highest quality standards for our <strong>creative gaming</strong> platform.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}