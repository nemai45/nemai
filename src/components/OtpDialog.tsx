"use client"

import { sendOtp, sendOtpForLogin, verifyOtpAndCreateSession } from "@/action/auth"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { OTP_EXPIRE_TIME } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"


interface OtpDialogProps {
    timeLeft: number
    setTimeLeft: React.Dispatch<React.SetStateAction<number>>
    open: boolean
    onOpenChange: (open: boolean) => void
    verificationId: string | null
    setVerificationId: React.Dispatch<React.SetStateAction<string | null>>
    phoneNumber: string
    isVerified?: boolean
    setIsVerified?: React.Dispatch<React.SetStateAction<boolean>>
    showResend: boolean
    setShowResend: React.Dispatch<React.SetStateAction<boolean>>
}

export default function OtpDialog({ open, onOpenChange, timeLeft, setTimeLeft, verificationId, setVerificationId, phoneNumber, isVerified, setIsVerified, showResend, setShowResend }: OtpDialogProps) {
    const [otp, setOtp] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    
    useEffect(() => {
        if (timeLeft <= 0) return

        timerRef.current = setInterval(() => {
            setTimeLeft((prevTime: number) => {
                if (prevTime <= 1) {
                    setShowResend(true)
                    return 0
                }
                return prevTime - 1
            })
        }, 1000)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [open, timeLeft, setTimeLeft])

    const resendOtp = useCallback(async () => {
        if (!verificationId || isResending || !showResend || timeLeft > 0) return
        setIsResending(true)
        if (isVerified !== undefined && setIsVerified !== undefined) {
            const response = await sendOtp(phoneNumber)
            if (response.error) {
                toast.error("Failed to send OTP")
            } else {
                setVerificationId(response.data.verificationId)
                setTimeLeft(OTP_EXPIRE_TIME)
                setOtp("")
                setShowResend(false)
                toast.success("OTP sent successfully")
            }
        } else {
            const response = await sendOtpForLogin(phoneNumber)
            if (response.error) {
                toast.error("Failed to send OTP")
            } else {
                setVerificationId(response.data.verificationId)
                setTimeLeft(OTP_EXPIRE_TIME)
                setOtp("")
                setShowResend(false)
                toast.success("OTP sent successfully")
            }
        }
        setIsResending(false)
    }, [phoneNumber, verificationId, isResending, showResend, timeLeft, setVerificationId, setTimeLeft])


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const verify = useCallback(async () => {
        if (!verificationId || otp.length !== 4 || isSubmitting) return
        setIsSubmitting(true)
        if (isVerified !== undefined && setIsVerified !== undefined) {
            const response = await verifyOtpAndCreateSession(phoneNumber, verificationId, otp, false)
            if (response.error) {
                toast.error(response.error)
            } else {
                setIsVerified(true)
                onOpenChange(false)
            }
        } else {
            const response = await verifyOtpAndCreateSession(phoneNumber, verificationId, otp, true)
            if (response.error) {
                toast.error(response.error)
            } else {
                onOpenChange(false)
            }
        }
        setIsSubmitting(false)
    }, [otp, onOpenChange, phoneNumber, verificationId])

    useEffect(() => {
        if (open) {
            if (timeLeft < 0) {
                setShowResend(true)
            } else {
                setOtp("")
            }
        }
    }, [open, setIsVerified])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verify Phone Number</DialogTitle>
                </DialogHeader>
                <div>
                    <div className="flex flex-col justify-center items-center mt-6 space-y-6 py-4">
                        <div className="w-full flex justify-center">
                            <InputOTP maxLength={4} value={otp} onChange={setOtp} disabled={isVerified || isSubmitting}>
                                <InputOTPGroup >
                                    <InputOTPSlot className=" border border-black" index={0} />
                                    <InputOTPSlot className=" border border-black" index={1} />
                                    <InputOTPSlot className=" border border-black" index={2} />
                                    <InputOTPSlot className=" border border-black" index={3} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <div
                            className={`flex items-center gap-2 text-sm text-muted-foreground`}
                        >
                            <span>Time remaining: {formatTime(timeLeft)}</span>
                        </div>
                        {showResend && (
                            <Button variant="outline" onClick={resendOtp} disabled={isResending}>
                                {isResending ? "Resending..." : "Resend OTP"}
                            </Button>
                        )}
                        {isVerified && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <span>OTP verified successfully!</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 items-center">
                        <Button
                            onClick={verify}
                            disabled={otp.length !== 4 || isVerified || isSubmitting}
                        >
                            {isSubmitting ? "Verifying..." : "Verify OTP"}
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Back
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )

}