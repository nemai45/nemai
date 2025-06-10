"use client"
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Artist } from '@/lib/type'; // Assuming this path and type definition
import { FilterX, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import ArtistCard from './dashboard/ArtistCard'; // Assuming this path
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

interface ArtistListProps {
  artists: Artist[];
  role: string;
}

const ArtistList = ({ artists, role }: ArtistListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const availableAreas = useMemo(() => {
    const areas = new Set(artists.map(artist => artist.area.name).filter(Boolean));
    return Array.from(areas);
  }, [artists]);

  const handleAreaChange = (area: string) => {
    setSelectedAreas(prevSelectedAreas =>
      prevSelectedAreas.includes(area)
        ? prevSelectedAreas.filter(a => a !== area)
        : [...prevSelectedAreas, area]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAreas([]);
  };

  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      const matchesSearchTerm = artist.business_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArea = selectedAreas.length === 0 || selectedAreas.includes(artist.area?.name || "");
      return matchesSearchTerm && matchesArea;
    });
  }, [artists, searchTerm, selectedAreas]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <Input
          type="text"
          placeholder="Search by artist name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs md:max-w-sm"
        />
        <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filter by Area
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter by Area</SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {availableAreas.length > 0 ? availableAreas.map(area => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      style={{ width: "24px", height: "24px" }}
                      id={`area-${area}`}
                      checked={selectedAreas.includes(area)}
                      onCheckedChange={() => handleAreaChange(area)}
                    />
                    <Label htmlFor={`area-${area}`} className="font-normal">
                      {area}
                    </Label>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No areas available to filter.</p>
                )}
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          {selectedAreas.length > 0 && <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
            <FilterX className="mr-2 h-4 w-4" /> Clear
          </Button>}
        </div>
      </div>

      {filteredArtists.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} role={role} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No artists found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default ArtistList;
