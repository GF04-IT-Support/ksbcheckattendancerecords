"use client";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  Link,
  Image,
} from "@nextui-org/react";

const Header = () => {
  return (
    <Navbar maxWidth="full" shouldHideOnScroll isBordered>
      <NavbarBrand className="flex items-center gap-2 max-w-full">
        <Link href="/">
          <Image
            src="/ksb.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </Link>
        <p className="font-bold text-inherit">
          <Link>KSB Staff Attendance Check</Link>
        </p>
      </NavbarBrand>
    </Navbar>
  );
};

export default Header;
