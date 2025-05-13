/* eslint-disable react/no-unescaped-entities */
"use client";
import Image from 'next/image';
import React, { useState } from 'react';
import { FaAngleRight } from "react-icons/fa6";
import { FcGoogle } from 'react-icons/fc';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { signInWithGoogle } from '@/action/auth';
import { toast } from 'sonner';

const Auth = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const signIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

    }

    const handleGoogleLogin = async () => {
        const { data, error } = await signInWithGoogle();
        if (error !== null) {
            toast(error)
        }
    }   


    return (
        <Card className="relative w-[300px] md:w-[450px] overflow-hidden p-6 shadow-[0_0_15px_rgba(0,0,0,0.1),0_0_3px_rgba(0,0,0,0.05)]">
            <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-pink-100 to-transparent"></div>
            <div className="flex flex-col items-center space-y-4">
                <Image src="/logo.png" className=' z-10' alt="Logo" width={80} height={80} />                <div className="flex text-center flex-col items-center space-y-4">
                    <h1 className="text-xl z-10 font-bold">Welcome!!</h1>
                    <p className="text-muted-foreground">Please enter your details to sign in.</p>
                </div>
            </div>
            <div className="mt-6">
                <button onClick={handleGoogleLogin} className="w-full unicorn-secondary-button">
                    <FcGoogle className="mr-2 w-6 h-6" />
                    <span className='sm:block hidden text-black'>Continue with Google</span>
                </button>
            </div>
            <div className="flex items-center gap-2 my-1 text-center">
                <div className='border-t-2 w-full'></div>
                <div>OR</div>
                <div className='border-t-2 w-full'></div>
            </div>
            <form className="space-y-4">
                <div className="space-y-2 flex flex-col">
                    <label htmlFor="phone" className='font-bold'>Phone No</label>
                    <Input value={formData.email} onChange={handleChange} name='phone' id="phone" placeholder="Enter your phone..." type="phone" required />
                </div>
                <Button type="submit" className="w-full" onClick={signIn}>
                    Continue <FaAngleRight />
                </Button>
            </form>
        </Card>
    )
}
export default Auth