"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TfiAlignRight } from "react-icons/tfi";
import { IoClose } from "react-icons/io5";
import NavLink from "./NavLink";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href:"/contact"},
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link, index) => (
          <NavLink key={link.name} {...link} index={index} />
        ))}
      </nav>

      {/* Toggle */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="md:hidden text-gray-300 hover:text-white transition z-50"
      >
        {open ? <IoClose size={26} /> : <TfiAlignRight size={24} />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-[70%] bg-black border-r border-white/10 z-50 p-6 flex flex-col gap-6"
            >
              {navLinks.map((link, index) => (
                <div key={link.name} onClick={() => setOpen(false)}>
                  <NavLink {...link} index={index} />
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}