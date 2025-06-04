"use client";
import ImageCropperModal from '@/components/ImageCropperModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from "@/components/ui/separator";
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/use-user';
import { CombinedInfo, combinedSchema, PersonalInfo, ProfessionalInfo } from '@/lib/type';
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Error from './Error';
import NailLoader from './NailLoader';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import OtpDialog from './OtpDialog';
import { sendOtp } from '@/action/auth';
import { OTP_EXPIRE_TIME } from '@/lib/utils';

interface ProfileCardProps {
    personalInfo: PersonalInfo
    professionalInfo: ProfessionalInfo | null
    areas: { id: number, name: string }[]
    isOnBoarding?: boolean
    handleSubmit: (data: CombinedInfo, logo: File | null) => Promise<{
        error: string;
        logo?: undefined;
    } | {
        logo: string | null | undefined;
        error: null;
    }>
}

const SUPABASE_BUCKET_URL_PREFIX = "https://ftqdfdhxdtekgjxrlggp.supabase.co/storage/v1/object/public/";


const ProfileCard: FC<ProfileCardProps> = ({ personalInfo, professionalInfo, handleSubmit, areas, isOnBoarding = false }) => {
    const [logo, setLogo] = useState<File | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(professionalInfo?.logo ? `${SUPABASE_BUCKET_URL_PREFIX}${professionalInfo.logo}` : null);

    const [loading, setLoading] = useState<boolean>(false);
    const [isAddressChanged, setIsAddressChanged] = useState<boolean>(false);

    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [showResend, setShowResend] = useState<boolean>(false);
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState<boolean>(!!personalInfo.phone_no);

    const form = useForm({
        resolver: zodResolver(combinedSchema),
        defaultValues: {
            personal: personalInfo,
            professional: {
                ...professionalInfo,
                logo: professionalInfo?.logo || '',
            }
        },
    });

    const { user, loading: isLoad, error, role } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoad && !user) {
            router.push('/login');
        }
    }, [isLoad, user, router]);

    useEffect(() => {
        if (professionalInfo?.logo && !logo) {
            setLogoUrl(`${SUPABASE_BUCKET_URL_PREFIX}${professionalInfo.logo}`);
        } else if (!professionalInfo?.logo && !logo) {
            setLogoUrl(null);
        }
    }, [professionalInfo?.logo, logo]);


    if (isLoad) return <NailLoader />;
    if (error) return <Error error={(error as any).message || 'An unknown error occurred'} />;
    if (!user) return null;

    const onSubmit = async (data: CombinedInfo) => {
        setLoading(true);
        if (isOnBoarding && !isVerified) {
            toast.error("Please verify your phone number");
            setLoading(false);
            return;
        }
        if (!data.professional?.is_work_from_home && !data.professional?.is_available_at_client_home) {
            toast.error("At least one of the options work from studio or available at client home must be selected");
            setLoading(false);
            return;
        }
        const { logo: newLogo, error: submitError } = await handleSubmit(data, logo);
        if (submitError) {
            toast.error(submitError);
            setLoading(false);
            return;
        }
        toast.success('Profile updated successfully');
        if (newLogo) {
            form.setValue('professional.logo', newLogo);
            setLogoUrl(`${SUPABASE_BUCKET_URL_PREFIX}${newLogo}`);
        } else {
            setLogoUrl(null);
        }
        setLoading(false);
    };

    const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageToCrop(URL.createObjectURL(file));
            setShowCropper(true);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCropConfirm = (croppedFile: File) => {
        setLogo(croppedFile);
        setLogoUrl(URL.createObjectURL(croppedFile));
        setShowCropper(false);
        setImageToCrop(null);
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    const sendPhoneOtp = async () => {
        const phoneNumber = form.getValues('personal.phone_no')
        if(phoneNumber.length !== 10){
            toast.error("Please enter a valid phone number")
            return
        }

        if (timeLeft > 0 || showResend) {
            setOpen(true)
            return
        }

        setLoading(true)
        const response = await sendOtp(phoneNumber)
        if (response.error) {
            toast.error(response.error)
        } else {
            setTimeLeft(OTP_EXPIRE_TIME)
            setVerificationId(response.data.verificationId)
            setOpen(true)
        }
        setLoading(false)
    }

    return (
        <>
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
                                                    <Input {...field} value={field.value || ''} readOnly={!isOnBoarding || isVerified} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {
                                        isOnBoarding && (
                                            <>
                                                <Button type="button" onClick={sendPhoneOtp} disabled={isVerified}>
                                                    Verify Phone Number
                                                </Button>
                                                <OtpDialog showResend={showResend} setShowResend={setShowResend} verificationId={verificationId} setVerificationId={setVerificationId} phoneNumber={form.getValues('personal.phone_no')} open={open} onOpenChange={setOpen} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isVerified={isVerified} setIsVerified={setIsVerified} />
                                            </>
                                        )
                                    }
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
                                                    <FormLabel>Logo</FormLabel>
                                                    <div className='relative w-24 h-24'>
                                                        <Avatar className="w-24 h-24 border-4 border-background">
                                                            <AvatarImage
                                                                src={logoUrl || undefined}
                                                                alt={`${personalInfo.first_name} ${personalInfo.last_name} logo`}
                                                            />
                                                            <AvatarFallback>
                                                                {getInitials(personalInfo.first_name, personalInfo.last_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <Button type="button" onClick={() => fileInputRef.current?.click()} size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 text-xs bg-primary hover:bg-primary/90">
                                                            <Camera className="h-4 w-4" />
                                                        </Button>
                                                        <Input id="logo-upload-input" type="file" accept="image/*"
                                                            ref={fileInputRef}
                                                            onChange={handleLogoFileChange}
                                                            className='hidden' />
                                                    </div>
                                                    <FormMessage />
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
                                                        <Input {...field} value={field.value || ''} />
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
                                                        <Input {...field} value={field.value || ''} onChange={(e) => {
                                                            setIsAddressChanged(true);
                                                            field.onChange(e);
                                                        }} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="professional.area"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Area</FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={(value: string) => {
                                                            console.log(value)
                                                            field.onChange(value)
                                                        }} defaultValue={field.value}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Area" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {areas.map((area) => (
                                                                    <SelectItem key={area.id} value={area.id.toString()}>{area.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
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
                                                        <Input {...field} value={field.value || ''} />
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
                                                        <Input min={1} defaultValue={1} type="number" {...field}
                                                            value={field.value ?? ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
                                                                if (value !== null && value < 1) {
                                                                    field.onChange(1);
                                                                } else {
                                                                    field.onChange(value);
                                                                }
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
                                                    <FormLabel>Pre-Book for months (1-3)</FormLabel>
                                                    <FormControl>
                                                        <Input min={1} defaultValue={1} max={3} type="number" {...field}
                                                            value={field.value ?? ''}
                                                            onChange={(e) => {
                                                                const rawValue = e.target.value;
                                                                if (rawValue === '') {
                                                                    field.onChange(null);
                                                                } else {
                                                                    let value = parseInt(rawValue, 10);
                                                                    if (value < 1) value = 1;
                                                                    else if (value > 3) value = 3;
                                                                    field.onChange(value);
                                                                }
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
                                                    <FormLabel>Google Map Link</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="professional.is_work_from_home"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className='flex items-center gap-2'>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} style={{ width: '1.5rem', height: '1.5rem' }} />
                                                            <FormLabel>Nail Studio</FormLabel>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="professional.is_available_at_client_home"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className='flex items-center gap-2'>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} style={{ width: '1.5rem', height: '1.5rem' }} />
                                                            <FormLabel>Available at Client Location</FormLabel>
                                                        </div>
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
                            <Button type="submit" disabled={loading || form.formState.isSubmitting}>Save</Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
            <ImageCropperModal

                isOpen={showCropper}
                onClose={() => {
                    setShowCropper(false);
                    setImageToCrop(null);
                }}
                imageSrc={imageToCrop}
                onCropConfirm={handleCropConfirm}
            />
        </>
    );
};

export default ProfileCard;
