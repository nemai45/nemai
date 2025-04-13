"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import Image from "next/image"
// Sample portfolio images
const PORTFOLIO_IMAGES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400&h=400",
    caption: "Pink Glitter Gel",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=400&h=400",
    caption: "Minimalist French Tips",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1610992015779-46217a252221?auto=format&fit=crop&q=80&w=400&h=400",
    caption: "Holiday Special",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?auto=format&fit=crop&q=80&w=400&h=400",
    caption: "Rainbow Accent",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&fit=crop&q=80&w=400&h=400",
    caption: "Marble Effect",
  },
]

const PortfolioManager = () => {
  const [images, setImages] = useState(PORTFOLIO_IMAGES)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropId: number) => {
    e.preventDefault()
    if (draggedItem === null) return

    const draggedIndex = images.findIndex((item) => item.id === draggedItem)
    const dropIndex = images.findIndex((item) => item.id === dropId)

    if (draggedIndex === dropIndex) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)

    setImages(newImages)
    setDraggedItem(null)
  }

  const handleDelete = (id: number) => {
    setImages(images.filter((image) => image.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Nail Art Gallery</h3>
        <Button className="unicorn-button">
          <Plus className="w-4 h-4 mr-2" /> Add New Photo
        </Button>
      </div>

      <p className="text-muted-foreground">
        Drag and drop to rearrange your portfolio. Your first images are shown to customers first.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card
            key={image.id}
            className="relative border border-border overflow-hidden cursor-move unicorn-card"
            draggable
            onDragStart={(e) => handleDragStart(e, image.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, image.id)}
          >
            <div className="aspect-square relative">
              <img src={image.url || "/placeholder.svg"} alt={image.caption} className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                <Button size="icon" variant="destructive" className="self-end" onClick={() => handleDelete(image.id)}>
                  <X className="w-4 h-4" />
                </Button>
                <input
                  type="text"
                  value={image.caption}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-md p-2 text-white w-full"
                  onChange={() => {}}
                  placeholder="Add a caption"
                />
              </div>
            </div>
          </Card>
        ))}

        <Card className="border border-dashed border-muted-foreground/50 aspect-square flex flex-col items-center justify-center p-6 text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
          <Image alt="" className="w-10 h-10 mb-2" />
          <p className="text-center">Drop your image here or click to upload</p>
        </Card>
      </div>
    </div>
  )
}

export default PortfolioManager
