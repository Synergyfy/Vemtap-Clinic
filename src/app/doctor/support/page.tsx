import React from "react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones, MessageSquare, Book, LifeBuoy } from "lucide-react";

export default function DoctorSupport() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Help & Support"
        description="Need assistance? Our clinical support team is here to help you 24/7."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="bg-emerald-600 text-white border-none">
          <CardContent className="p-6">
            <MessageSquare size={32} className="mb-4 text-emerald-100" />
            <h3 className="text-lg font-bold">Live Chat</h3>
            <p className="text-sm text-emerald-100 mt-2 mb-6">Talk to a support specialist right now for urgent issues.</p>
            <button className="w-full py-3 rounded-xl bg-white text-emerald-700 font-bold hover:bg-emerald-50 transition-all">
              Start Conversation
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book size={18} className="text-emerald-600" />
              Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500 italic underline cursor-pointer hover:text-emerald-600 transition-colors">How to use the visual acuity module</p>
            <p className="text-sm text-slate-500 italic underline cursor-pointer hover:text-emerald-600 transition-colors">Interpreting automated refraction data</p>
            <p className="text-sm text-slate-500 italic underline cursor-pointer hover:text-emerald-600 transition-colors">Managing multi-branch patient records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy size={18} className="text-sky-600" />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-700 font-bold">Email: <span className="text-slate-500 font-medium">clinical@vemtap.com</span></p>
            <p className="text-sm text-slate-700 font-bold">Phone: <span className="text-slate-500 font-medium">+234 (0) 800 VEMTAP</span></p>
            <p className="text-sm text-slate-500 mt-4 leading-relaxed">Available Mon-Fri, 8 AM - 6 PM for technical training.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
