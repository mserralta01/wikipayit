'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function TermsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const sections = [
    {
      title: "1. AGREEMENT TO TERMS",
      content: `These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and Wiki Payit, LLC ("Company," "we," "us," or "our"), concerning your access to and use of the website located at [https://www.wikipayit.com] (the "Site"), as well as any other media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto. You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Use.

IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.

Supplemental terms and conditions or documents that may be posted on the Site from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Use at any time for any reason. We will alert you about any such changes by updating the "Last Updated" date of these Terms of Use. You waive any right to receive specific notice of each such change.

The information provided on the Site is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation, or which would subject us to any registration requirement within such jurisdiction or country.

The Site is intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Site.`
    },
    {
      title: "2. INTELLECTUAL PROPERTY RIGHTS",
      content: `Unless otherwise indicated, the Site is our proprietary property, and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics (collectively, the "Content") and any trademarks, service marks, and logos (the "Marks") contained therein are owned or controlled by us or licensed to us. The Content and the Marks are protected by copyright, trademark, and various other intellectual property and unfair competition laws of the United States and foreign jurisdictions.

Except as expressly provided in these Terms of Use, no part of the Site, Content, or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose without our express prior written permission.`
    },
    {
      title: "3. USER REPRESENTATIONS",
      content: `By using the Site, you represent and warrant that:
• You have the legal capacity and you agree to comply with these Terms of Use;
• You are not a minor in the jurisdiction in which you reside (i.e., you are at least 18 years of age);
• You will not access the Site through automated or non-human means (e.g., a bot or script);
• You will not use the Site for any illegal or unauthorized purpose;
• Your use of the Site will not violate any applicable law or regulation.`
    },
    {
      title: "4. PROHIBITED ACTIVITIES",
      content: `You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those specifically endorsed or approved by us.`
    },
    {
      title: "5. USER GENERATED CONTRIBUTIONS",
      content: `The Site does not currently offer users the ability to post content. If in the future the Site does permit user contributions ("Contributions"), any Contributions must comply with all laws, must not violate others' rights, and must not be offensive or misleading, among other requirements.`
    },
    {
      title: "6. CONTRIBUTION LICENSE",
      content: `By submitting suggestions or other feedback regarding the Site, you agree that we can use and share such feedback for any purpose without compensation to you.`
    },
    {
      title: "7. SUBMISSIONS",
      content: `Any questions, comments, suggestions, ideas, feedback, or other information regarding the Site ("Submissions") provided by you are non-confidential and will become our sole property.`
    },
    {
      title: "8. SITE MANAGEMENT",
      content: `We reserve the right, but not the obligation, to monitor the Site for violations of these Terms of Use and take appropriate legal action.`
    },
    {
      title: "9. PRIVACY POLICY",
      content: `We care about data privacy and security. Please review our posted Privacy Policy for information on how we collect, use, and share your information.`
    },
    {
      title: "10. TERM AND TERMINATION",
      content: `These Terms of Use remain in full force and effect while you use the Site. We reserve the right to deny access to the Site to any person for any reason.`
    },
    {
      title: "11. MODIFICATIONS AND INTERRUPTIONS",
      content: `We reserve the right to change, modify, or remove the contents of the Site at any time without notice.`
    },
    {
      title: "12. GOVERNING LAW",
      content: `These Terms of Use and your use of the Site are governed by and construed in accordance with the laws of the State of Florida, without regard to conflict of law principles.`
    },
    {
      title: "13. DISPUTE RESOLUTION",
      content: `13.1 Informal Negotiations
Parties will first attempt to resolve disputes informally within 30 days.

13.2 Binding Arbitration
Unresolved disputes shall be resolved by binding arbitration in Palm Beach County, Florida.

13.3 Restrictions
Arbitration shall be limited to disputes between parties individually, with no class actions permitted.

13.4 Exceptions
Actions to protect intellectual property rights or seek injunctive relief are not subject to arbitration.`
    },
    {
      title: "14. RELATIONSHIP WITH CREDIT CARD PROCESSORS",
      content: `We serve solely as a broker or agent that recommends third-party credit card processors or merchant services. We are not responsible for the actions, omissions, or performance of any third-party processor.`
    },
    {
      title: "15. WEBSITE DESIGN AND LOCAL MARKETING SERVICES",
      content: `If you choose to use our website design services, you are responsible for all content, and we make no guarantees regarding uptime, performance, or results.`
    },
    {
      title: "16. CORRECTIONS",
      content: `We reserve the right to correct any errors and to change or update information at any time, without prior notice.`
    },
    {
      title: "17. DISCLAIMER",
      content: `THE SITE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS. YOU AGREE THAT YOUR USE OF THE SITE IS AT YOUR SOLE RISK.`
    },
    {
      title: "18. LIMITATIONS OF LIABILITY",
      content: `TO THE FULLEST EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM YOUR USE OF THE SITE.`
    },
    {
      title: "19. INDEMNIFICATION",
      content: `You agree to defend, indemnify, and hold us harmless from any claims arising from your use of the Site or breach of these Terms.`
    },
    {
      title: "20. USER DATA",
      content: `You are solely responsible for any data you transmit or that relates to activity you have undertaken using the Site.`
    },
    {
      title: "21. ELECTRONIC COMMUNICATIONS",
      content: `You consent to receive electronic communications from us and agree that all agreements and notices satisfy legal requirements for written communications.`
    },
    {
      title: "22. FLORIDA USERS AND RESIDENTS",
      content: `Florida residents with unresolved complaints may contact the Florida Department of Agriculture and Consumer Services, Division of Consumer Services.`
    },
    {
      title: "23. MISCELLANEOUS",
      content: `These Terms constitute the entire agreement between you and us. Our failure to exercise any right shall not constitute a waiver of such right.`
    },
    {
      title: "CONTACT US",
      content: `If you have any questions regarding these Terms of Use, you may contact us at:

Wiki Payit, LLC
15815 Boeing Court
Wellington, FL 33414
Phone: (305) 396-1226
Email: matt@wikipayit.com`
    }
  ];

  const toggleAll = () => {
    if (expandedSections.length === sections.length) {
      setExpandedSections([]);
    } else {
      setExpandedSections(sections.map((_, index) => `section-${index}`));
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="bg-white shadow-lg">
        <CardHeader className="text-center border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold text-primary">Terms and Conditions of Use</CardTitle>
            <Button 
              variant="outline"
              onClick={toggleAll}
              className="flex items-center gap-2"
            >
              {expandedSections.length === sections.length ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Expand All
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6">
              <Accordion 
                type="multiple" 
                value={expandedSections}
                onValueChange={setExpandedSections}
                className="w-full"
              >
                {sections.map((section, index) => (
                  <AccordionItem key={index} value={`section-${index}`}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                      {section.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 