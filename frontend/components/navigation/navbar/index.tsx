import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent} from "@/components/ui/dropdown-menu";

const Navbar = async () => {

    return (
        <nav
            className="flex-between background-light900_dark200 fixed z-50 w-full p-6 shadow-light-300 dark:shadow-none sm:px-12">
            <Link href="/" className="flex items-center gap-1">
                <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
                    Food<span className="text-primary-500">Delivery</span>
                </p>
            </Link>

            <div className="flex-between gap-5">

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar>
                                <AvatarImage src='' alt="User Avatar" />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Link href="/logout">Logout</Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
            </div>
        </nav>
    );
};

export default Navbar;
