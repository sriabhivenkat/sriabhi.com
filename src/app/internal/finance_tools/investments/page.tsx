"use client";
import React, {useEffect, useState} from "react";
import DashNav from "@/components/DashNav";

export default function Page() {
    return (
            <div className="min-h-screen lg:h-screen lg:overflow-hidden
                     bg-[#F4F2F3]
                     flex flex-col justify-center items-center p-2"
            >
                <DashNav />
                <div>
                    
                </div>
            </div>
    )
}