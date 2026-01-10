import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    // Main Container: h-screen locks to viewport height, overflow-hidden prevents body scroll
    <div className="flex h-screen w-full overflow-hidden font-sans bg-[#C9C5F8]">
      
      {/* LEFT SIDE - Branding Area 
          hidden on mobile, flex on large screens. 
          w-1/2 takes exactly half width.
      */}
      <div className="hidden lg:flex w-1/2 bg-[#F3F4F6] relative items-center justify-center h-full overflow-hidden">
        
        {/* Background decorative faint image */}
        <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center mix-blend-multiply pointer-events-none"></div>
        
        {/* Logo Container - Scaled for responsiveness */}
        <div className="relative z-10 p-8 transform scale-75 xl:scale-100 transition-transform duration-300">
          <div className="border border-black p-4 relative inline-block text-center select-none">
             {/* Logo Text Construction */}
             <div className="relative">
                <h1 className="text-7xl xl:text-8xl font-bold tracking-tighter text-black">
                  FIST-O
                </h1>
                {/* Horizontal Line left */}
                <div className="absolute -left-8 bottom-3 w-8 h-[2px] bg-black"></div>
                 {/* Horizontal Line right */}
                 <div className="absolute -right-8 bottom-3 w-8 h-[2px] bg-black"></div>
             </div>
             
             <div className="flex justify-between items-end mt-[-8px] xl:mt-[-10px]">
                <h2 className="text-2xl xl:text-3xl font-normal tracking-wide text-black bg-[#F3F4F6] px-2 z-10 relative">
                  TECH PVT LTD
                </h2>
                <span className="text-xs xl:text-sm font-medium mb-1">3D/AR/VR</span>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form Area 
          w-full on mobile, w-1/2 on large screens.
          overflow-y-auto allows ONLY this side to scroll if screen is too short.
      */}
      <div className="w-full lg:w-1/2 h-full bg-[#C9C5F8] flex flex-col justify-center items-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          
          <h2 className="text-3xl xl:text-4xl font-normal text-black text-center">
            Sign-Up
          </h2>

          <form className="space-y-4 xl:space-y-5">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="block text-base xl:text-lg text-black font-medium pl-2">Name</label>
              <input
                type="text"
                placeholder="Enter your Name"
                className="w-full px-5 py-2.5 xl:py-3 rounded-full text-sm text-gray-700 placeholder-gray-400 bg-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-base xl:text-lg text-black font-medium pl-2">Email Id</label>
              <input
                type="email"
                placeholder="Enter your Email ID"
                className="w-full px-5 py-2.5 xl:py-3 rounded-full text-sm text-gray-700 placeholder-gray-400 bg-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-base xl:text-lg text-black font-medium pl-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create your Password"
                  className="w-full px-5 py-2.5 xl:py-3 rounded-full text-sm text-gray-700 placeholder-gray-400 bg-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 text-xl focus:outline-none"
                >
                  {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="block text-base xl:text-lg text-black font-medium pl-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re- Enter your Password"
                  className="w-full px-5 py-2.5 xl:py-3 rounded-full text-sm text-gray-700 placeholder-gray-400 bg-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm pr-12 transition-all"
                />
                 <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 text-xl focus:outline-none"
                >
                  {showConfirmPassword ? <IoMdEyeOff /> : <IoMdEye />}
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="submit"
                className="w-48 bg-[#544AF4] hover:bg-[#4338ca] text-white font-medium py-2.5 xl:py-3 rounded-full shadow-lg transition duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-[#544AF4]"
              >
                Sign Up
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm text-gray-800">
              Already have an account?{" "}
              <a href="/" className="text-[#544AF4] underline hover:text-[#4338ca] font-medium">
                Sign in
              </a>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 py-1">
                <div className="h-[1px] bg-white opacity-70 flex-1"></div>
                <span className="text-white text-xs opacity-90">or</span>
                <div className="h-[1px] bg-white opacity-70 flex-1"></div>
            </div>

            {/* Google Sign In */}
            <div className="flex justify-center pb-4">
                <button
                type="button"
                className="flex items-center justify-center gap-3 w-full max-w-xs bg-white text-black font-medium py-2.5 xl:py-3 rounded-full shadow-md hover:bg-gray-50 transition duration-200"
                >
                <FcGoogle className="text-xl xl:text-2xl" />
                <span className="text-sm xl:text-base">Sign-In with Google</span>
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;