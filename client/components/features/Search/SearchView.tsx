'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Search, Users, BadgeCheck } from 'lucide-react';
import { useLocalLenis } from '@/hooks/useLocalLenis';
import { searchService, SearchResults } from '@/services/search.service';
import Link from 'next/link';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

export function SearchView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainFeedRef = useRef<HTMLElement>(null);
  const rightSidebarRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();

  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResults>({ users: [], posts: [], locations: [] });
  const [loading, setLoading] = useState(false);

  useLocalLenis(mainFeedRef);
  useLocalLenis(rightSidebarRef);

  useEffect(() => {
    const doSearch = async () => {
      if (!query.trim()) {
        setResults({ users: [], posts: [], locations: [] });
        return;
      }
      try {
        setLoading(true);
        const data = await searchService.globalSearch(query.trim());
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };
    doSearch();
  }, [query]);

  const totalResults = results.users.length + results.posts.length;

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-row justify-between w-full h-[calc(100vh-64px)] px-2 sm:px-4 lg:px-8 xl:px-12 mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:flex w-64 lg:w-72 shrink-0 justify-start h-full">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <main
          ref={mainFeedRef}
          className="flex-1 w-full max-w-[650px] mx-auto overflow-y-auto relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="w-full min-h-full pb-12">

            {/* Sticky Page Header */}
            <div className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2a2a3e] px-4 py-4">
              <h1 className="text-xl font-bold text-white leading-tight">
                {query ? (
                  <>Search results for <span className="text-[#8B5CF6]">"{query}"</span></>
                ) : (
                  'Search'
                )}
              </h1>
              {query && !loading && (
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  {totalResults} result{totalResults !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            {/* Empty / Idle State */}
            {!query && (
              <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center mb-5">
                  <Search className="w-7 h-7 text-[#8B5CF6]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Search Koottam</h2>
                <p className="text-[#9ca3af] text-sm max-w-xs leading-relaxed">
                  Use the search bar above to find people, posts, and topics.
                </p>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#1a1a2e] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-[#1a1a2e] rounded-full w-2/5" />
                      <div className="h-3 bg-[#1a1a2e] rounded-full w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {!loading && query && (
              <>
                {totalResults === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-[#6b7280]" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No results for "{query}"</h3>
                    <p className="text-[#9ca3af] text-sm">Try a different name or username.</p>
                  </div>
                ) : (
                  <>
                    {/* Users Section */}
                    {results.users.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-4 pt-5 pb-3">
                          <Users className="w-4 h-4 text-[#8B5CF6]" />
                          <h2 className="text-base font-bold text-white">People</h2>
                          <span className="ml-auto text-xs text-[#6b7280] font-medium">
                            {results.users.length} result{results.users.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="divide-y divide-[#1a1a2e]">
                          {results.users.map((u) => (
                            <Link
                              key={u.id}
                              href={`/${u.username}`}
                              className="flex items-center gap-4 px-4 py-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer group"
                            >
                              <div className="w-12 h-12 rounded-full bg-[#8B5CF6] shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                                ) : (
                                  getInitials(u.full_name || u.username)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <p className="text-white font-bold text-[15px] truncate group-hover:text-[#8B5CF6] transition-colors">
                                    {u.full_name || u.username}
                                  </p>
                                  {u.is_verified && (
                                    <BadgeCheck className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                                  )}
                                </div>
                                <p className="text-[#9ca3af] text-sm truncate">@{u.username}</p>
                              </div>
                              <button
                                onClick={(e) => e.preventDefault()}
                                className="px-4 py-1.5 rounded-full border border-[#2a2a3e] text-white text-sm font-semibold hover:bg-[#8B5CF6] hover:border-[#8B5CF6] transition-colors cursor-pointer shrink-0"
                              >
                                Follow
                              </button>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside
          ref={rightSidebarRef}
          className="hidden xl:block w-[350px] overflow-y-auto shrink-0 flex-none h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pl-4"
        >
          <div className="py-6 space-y-5">
            <section className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-5">
              <h2 className="text-base font-bold text-white mb-3">Search tips</h2>
              <ul className="space-y-2 text-sm text-[#9ca3af]">
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5CF6] mt-0.5">•</span>
                  Search by name or <span className="text-white font-medium mx-1">@username</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5CF6] mt-0.5">•</span>
                  Hashtag search coming soon
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B5CF6] mt-0.5">•</span>
                  Location search coming soon
                </li>
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
