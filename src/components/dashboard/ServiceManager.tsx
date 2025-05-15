"use client"

import { addArtistService, deleteArtistService, updateArtistService } from "@/action/user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Service, serviceSchema } from "@/lib/type"
import { zodResolver } from "@hookform/resolvers/zod"
import { Clock, Edit, Plus, Trash } from "lucide-react"
import { FC, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

interface ServiceManagerProps {
  services: Service[]
}

const ServiceManager: FC<ServiceManagerProps> = ({ services }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const form = useForm<Service>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 0,
      add_on: [],
    },
    resolver: zodResolver(serviceSchema)
  })

  const handleAddService = () => {
    setEditingService(null)
    form.reset({
      name: "",
      description: "",
      price: 0,
      duration: 0,
      add_on: [],
    })
    setIsDialogOpen(true)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    form.reset({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration: service.duration,
      add_on: service.add_on,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    const { error } = await deleteArtistService(serviceId)
    if (error) {
      toast.error("Error deleting service: " + error)
      return
    }
    toast.success("Service deleted successfully.")
  }

  const onSubmit = async (data: Service) => {
    if (!editingService) {
      const { error } = await addArtistService(data)
      if (error) {
        toast.error("Error adding service: " + error)
        return
      }
      toast.success("Service added successfully.")
      setIsDialogOpen(false)
      form.reset({
        name: "",
        description: "",
        price: 0,
        duration: 0,
        add_on: [],
      })
    } else {
      const { error } = await updateArtistService({
        ...data,
        id: editingService.id,
      })
      if (error) {
        toast.error("Error updating service: " + error)
        return
      }
      toast.success("Service updated successfully.")
      setIsDialogOpen(false)
    }
  }

  const addAddOn = () => {
    const currentAddOns = form.getValues().add_on || []
    form.setValue("add_on", [...currentAddOns, { name: "", price: 0}])
  }

  const removeAddOn = (index: number) => {
    const currentAddOns = form.getValues().add_on || []
    const updatedAddOns = currentAddOns.map((addOn, i) => {
      if(i === index) {
        return {
          ...addOn,
          is_deleted: true,
        }
      }
      return addOn
    })
    const filteredAddOns = updatedAddOns.filter((addOn) => {
      if(!addOn.id && addOn.is_deleted) {
        return false
      }
      return true
    })

    form.setValue(
      "add_on",
      filteredAddOns
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Your Services</CardTitle>
            <CardDescription>Manage the services you offer to clients</CardDescription>
          </div>
          <Button onClick={handleAddService}>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </CardHeader>
        <CardContent>
          {services.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id!} className="overflow-hidden">
                  <CardContent>
                    <h1 className="text-lg font-bold pb-2">{service.name}</h1>
                    {<p className="text-sm text-muted-foreground mb-2">{service.description }</p>}
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center">
                        <span>₹{service.price}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteService(service.id!)}>
                      <Trash className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">You haven&apos;t added any services yet.</p>
              <Button onClick={handleAddService}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>
              {editingService
                ? "Make changes to your existing service."
                : "Create a new service to offer to your clients."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Gel Manicure" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what's included in this service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Duration (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Add-on Services (Optional)</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAddOn}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                {form.watch('add_on')?.map((addOn, index) => (
                  !addOn.is_deleted && (
                    <div key={index} className="flex gap-2 items-end">
                      <FormField
                        control={form.control}
                      name={`add_on.${index}.name`}
                      render={({ field }: { field: any }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input min={1} placeholder="Add-on name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`add_on.${index}.price`}
                      render={({ field }: { field: any }) => (
                        <FormItem className="w-24">
                          <FormControl>
                            <Input placeholder="Price (per nail)" type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeAddOn(index)}
                    >
                      <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                ))}
              </div>

              <DialogFooter>
                <Button type="submit">
                  {editingService ? 'Update Service' : 'Add Service'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceManager;
