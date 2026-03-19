"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";

type Props = {
  name: string;
  href: string;
  index: number;
};

export default function NavLink({ name, href, index }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="relative"
    >
      <Link
        href={href}
        className={clsx(
          "relative text-sm font-medium px-1 py-1 transition tracking-wide",
          isActive ? "text-white" : "text-gray-400 hover:text-white"
        )}
      >
        {name}

        {isActive && (
          <motion.span
            layoutId="nav-underline"
            className="absolute left-0 -bottom-1 h-[2px] w-full bg-red-500 tracking-wide"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  );
}