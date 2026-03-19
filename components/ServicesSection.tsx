"use client";

import { motion } from "framer-motion";
import { services } from "@/data/services";
import ServiceCard from "./ServiceCard";

export default function ServicesSection() {
  return (
    <motion.section
      className="py-20 px-6 bg-neutral-950"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">What I Do</h2>
        <p className="text-neutral-400">
          Services I offer for personal, startups and companies who need a professional to fast track their ideas.
        </p>
      </div>

      <motion.div
        className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {services.map((service) => (
          <ServiceCard
            key={service.title}
            title={service.title}
            description={service.description}
            tags={service.tags}
          />
        ))}
      </motion.div>
    </motion.section>
  );
}