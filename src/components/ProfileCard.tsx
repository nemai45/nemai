"use client";
import { useUser } from '@/hooks/use-user';
import { CombinedInfo, combinedSchema, PersonalInfo, ProfessionalInfo } from '@/lib/type';
import { getLocation } from '@/lib/utils';
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from '@radix-ui/react-separator';
import { Camera } from 'lucide-react';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import NailLoader from './NailLoader';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface ProfileCardProps {
    personalInfo: PersonalInfo
    professionalInfo: ProfessionalInfo | null
    handleSubmit: (data: CombinedInfo, logo: File | null, point: { lat: number, lng: number } | null) => Promise<{ error: string | null }>
}

const ProfileCard: FC<ProfileCardProps> = ({ personalInfo, professionalInfo, handleSubmit }) => {
    const { role } = useUser()
    const [logo, setLogo] = useState<File | null>(null)
    const [logoUrl, setLogoUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [isAddressChanged, setIsAddressChanged] = useState<boolean>(false)
    const form = useForm({
        resolver: zodResolver(combinedSchema),
        defaultValues: {
            personal: personalInfo,
            professional: professionalInfo
        },
    });

    const onSubmit = async (data: CombinedInfo) => {
        setLoading(true)
        if(data.professional && data.professional.no_of_artists < 1) {
            toast.error('Max clients must be greater than 0')
            setLoading(false)
            return;
        }
        let point: { lat: number, lng: number } | null = null;
        if (data.professional) {
            if (isAddressChanged) {
                const { lat, lng, error } = await getLocation(data.professional.address)
                if (error) {
                    toast.error(error)
                    setLoading(false)
                    return;
                }
                point = { lat, lng }
            }
        }
        const { error } = await handleSubmit(data, logo, point)
        if (error) {
            toast.error(error)
            setLoading(false)
            return;
        }
        toast.success('Profile updated successfully')
        setLoading(false)
    }

    return (
        <Form {...form}>
            {loading && <NailLoader />}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-3xl space-y-6"
            >
                <Card>
                    <CardContent className="space-y-6 mt-4">
                        <div>
                            <h3 className="text-lg font-semibold">Personal Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="personal.first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="personal.last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="personal.email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} readOnly />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="personal.phone_no"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {role === "artist" && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Professional Information
                                    </h3>
                                    <FormField
                                        control={form.control}
                                        name="professional.logo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className='relative w-24'>
                                                    <Avatar className="w-24 h-24 border-4 border-background">
                                                        <AvatarImage
                                                            src={field.value ? `https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/${field.value}` : logoUrl || ''}
                                                            alt={`${personalInfo.first_name} ${personalInfo.last_name}`}
                                                        />
                                                    </Avatar>
                                                    <Button type="button" onClick={() => document.getElementById("logo-upload")?.click()} size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 text-xs bg-primary">
                                                        <Camera className="h-4 w-4" />
                                                        <Input id="logo-upload" type="file" accept="image/*" onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) {
                                                                setLogo(file)
                                                                const url = URL.createObjectURL(file)
                                                                setLogoUrl(url)
                                                            }
                                                        }} className='hidden' />
                                                    </Button>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="professional.business_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="professional.bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} value={field.value || ''} rows={3} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="professional.address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Input {...field} onChange={(e) => {
                                                        setIsAddressChanged(true)
                                                        field.onChange(e)
                                                    }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="professional.upi_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>UPI ID</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="professional.no_of_artists"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>No. of Artists</FormLabel>
                                                <FormControl>
                                                    <Input min={1} defaultValue={1} type="number" {...field} onChange={(e) => {
                                                        const value = parseInt(e.target.value)
                                                        if (value < 1) {
                                                            field.onChange(1)
                                                        }
                                                        field.onChange(value)
                                                    }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="professional.booking_month_limit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Booking Month Limit</FormLabel>
                                                <FormControl>
                                                    <Input min={1} defaultValue={1} max={3} type="number" {...field} onChange={(e) => {
                                                        const value = parseInt(e.target.value)
                                                        if (value < 1) {
                                                            field.onChange(1)
                                                        }
                                                        field.onChange(value)
                                                    }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="professional.location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Goole Map Link</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={loading}>Save</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}

export default ProfileCard

