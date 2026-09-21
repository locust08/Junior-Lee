import React from 'react';
import { siteConfig } from '../../../config/site';

const whatsappUrl = siteConfig.social.whatsapp;

const HowToApplySectionCustomComponents3: React.FC = () => {
    return (
        <div data-from-ai="false">
  <section className="py-20 bg-white">
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="font-heading text-5xl xs:text-7xl tracking-tight mb-6">Step-by-Step Process</h2>
        <p className="text-lg text-gray-600">A clear and simple path from application to approval.</p>
      </div>
      <div className="flex flex-wrap -mx-4">
        <div className="w-full md:w-1/2 lg:w-1/4 px-4 mb-8">
          <div className="h-full p-8 bg-gray-50 rounded-2xl hover:shadow-xl transition duration-200">
            <div className="flex items-center justify-center w-14 h-14 mb-6 text-2xl font-bold text-black bg-lime-500 rounded-full">1</div>
            <h5 className="font-heading text-2xl tracking-tight mb-3">Choose Your Loan</h5>
            <p className="text-gray-600">Select the loan option that best fits your needs and budget from our range of services.</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/4 px-4 mb-8">
          <div className="h-full p-8 bg-gray-50 rounded-2xl hover:shadow-xl transition duration-200">
            <div className="flex items-center justify-center w-14 h-14 mb-6 text-2xl font-bold text-black bg-lime-500 rounded-full">2</div>
            <h5 className="font-heading text-2xl tracking-tight mb-3">Submit Documents</h5>
            <p className="text-gray-600">Prepare and upload the required documents listed below to verify your eligibility.</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/4 px-4 mb-8">
          <div className="h-full p-8 bg-gray-50 rounded-2xl hover:shadow-xl transition duration-200">
            <div className="flex items-center justify-center w-14 h-14 mb-6 text-2xl font-bold text-black bg-lime-500 rounded-full">3</div>
            <h5 className="font-heading text-2xl tracking-tight mb-3">Get Reviewed</h5>
            <p className="text-gray-600">Our team reviews your application quickly and contacts you for any clarifications.</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/4 px-4 mb-8">
          <div className="h-full p-8 bg-gray-50 rounded-2xl hover:shadow-xl transition duration-200">
            <div className="flex items-center justify-center w-14 h-14 mb-6 text-2xl font-bold text-black bg-lime-500 rounded-full">4</div>
            <h5 className="font-heading text-2xl tracking-tight mb-3">Receive Funds</h5>
            <p className="text-gray-600">Once approved, your loan amount is disbursed directly to your account.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap -mx-4 items-center">
        <div className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0">
          <img className="block rounded-xl w-full" src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80" alt="" />
        </div>
        <div className="w-full lg:w-1/2 px-4">
          <h2 className="font-heading text-5xl xs:text-7xl tracking-tight mb-6">Required Documents</h2>
          <p className="text-lg text-gray-600 mb-8">Have these documents ready before you apply to ensure a smooth and speedy process.</p>
          <ul className="space-y-4">
            <li className="flex items-start p-4 bg-white rounded-xl shadow">
              <span className="flex items-center justify-center w-8 h-8 mr-4 text-sm font-bold text-black bg-lime-500 rounded-full">✓</span>
              <div>
                <h5 className="font-heading text-xl tracking-tight mb-1">Valid Government ID</h5>
                <p className="text-gray-600">Passport, driver's license, or national ID card.</p>
              </div>
            </li>
            <li className="flex items-start p-4 bg-white rounded-xl shadow">
              <span className="flex items-center justify-center w-8 h-8 mr-4 text-sm font-bold text-black bg-lime-500 rounded-full">✓</span>
              <div>
                <h5 className="font-heading text-xl tracking-tight mb-1">Proof of Income</h5>
                <p className="text-gray-600">Recent payslips, bank statements, or tax returns.</p>
              </div>
            </li>
            <li className="flex items-start p-4 bg-white rounded-xl shadow">
              <span className="flex items-center justify-center w-8 h-8 mr-4 text-sm font-bold text-black bg-lime-500 rounded-full">✓</span>
              <div>
                <h5 className="font-heading text-xl tracking-tight mb-1">Proof of Address</h5>
                <p className="text-gray-600">Utility bill or lease agreement dated within 3 months.</p>
              </div>
            </li>
            <li className="flex items-start p-4 bg-white rounded-xl shadow">
              <span className="flex items-center justify-center w-8 h-8 mr-4 text-sm font-bold text-black bg-lime-500 rounded-full">✓</span>
              <div>
                <h5 className="font-heading text-xl tracking-tight mb-1">Bank Account Details</h5>
                <p className="text-gray-600">Active bank account for loan disbursement.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  <section className="py-20 bg-white">
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="font-heading text-5xl xs:text-7xl tracking-tight mb-6">Eligibility Requirements</h2>
        <p className="text-lg text-gray-600">Make sure you meet these basic requirements before you apply.</p>
      </div>
      <div className="flex flex-wrap -mx-4 max-w-4xl mx-auto">
        <div className="w-full md:w-1/2 px-4 mb-8">
          <div className="flex items-center h-full p-6 bg-gray-50 rounded-xl">
            <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 mr-4 text-lg font-bold text-black bg-lime-500 rounded-full">18+</span>
            <p className="text-lg font-medium">You must be at least 18 years old.</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 px-4 mb-8">
          <div className="flex items-center h-full p-6 bg-gray-50 rounded-xl">
            <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 mr-4 text-lg font-bold text-black bg-lime-500 rounded-full">$</span>
            <p className="text-lg font-medium">Have a stable and verifiable source of income.</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 px-4 mb-8">
          <div className="flex items-center h-full p-6 bg-gray-50 rounded-xl">
            <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 mr-4 text-lg font-bold text-black bg-lime-500 rounded-full">★</span>
            <p className="text-lg font-medium">Be a resident or citizen with valid documents.</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 px-4 mb-8">
          <div className="flex items-center h-full p-6 bg-gray-50 rounded-xl">
            <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 mr-4 text-lg font-bold text-black bg-lime-500 rounded-full">✓</span>
            <p className="text-lg font-medium">Maintain an active bank account.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section className="py-20 bg-gray-50" id="apply">
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap -mx-4 items-center">
        <div className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0">
          <h2 className="font-heading text-5xl xs:text-7xl tracking-tight mb-6">Ready to Apply?</h2>
          <p className="text-lg text-gray-600 mb-8">Fill out the quick form below or chat with us instantly on WhatsApp to get started right away.</p>
          <a className="inline-flex py-4 px-6 items-center justify-center text-lg font-medium text-white bg-green-500 hover:bg-green-600 rounded-full transition duration-200" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
        </div>
        <div className="w-full lg:w-1/2 px-4">
          <form className="p-8 bg-white rounded-2xl shadow-xl">
            <div className="mb-4">
              <label className="block pl-4 mb-1 text-sm font-medium">Full Name</label>
              <input className="w-full px-4 py-3 outline-none ring-offset-0 focus:ring-2 focus:ring-lime-500 shadow rounded-full" type="text" name="name" placeholder="John Doe" />
            </div>
            <div className="mb-4">
              <label className="block pl-4 mb-1 text-sm font-medium">Email Address</label>
              <input className="w-full px-4 py-3 outline-none ring-offset-0 focus:ring-2 focus:ring-lime-500 shadow rounded-full" type="email" name="email" placeholder="john@example.com" />
            </div>
            <div className="mb-4">
              <label className="block pl-4 mb-1 text-sm font-medium">Phone Number</label>
              <input className="w-full px-4 py-3 outline-none ring-offset-0 focus:ring-2 focus:ring-lime-500 shadow rounded-full" type="tel" name="phone" placeholder="+1 234 567 890" />
            </div>
            <div className="mb-4">
              <label className="block pl-4 mb-1 text-sm font-medium">Loan Type</label>
              <select className="w-full cursor-pointer px-4 py-3 outline-none ring-offset-0 focus:ring-2 focus:ring-lime-500 shadow rounded-full appearance-none" name="loan-type">
                <option>Personal Loan</option>
                <option>Business Loan</option>
                <option>Home Loan</option>
                <option>Auto Loan</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block pl-4 mb-1 text-sm font-medium">Message</label>
              <textarea className="w-full px-4 py-3 outline-none ring-offset-0 focus:ring-2 focus:ring-lime-500 shadow rounded-xl resize-none" name="message" rows={3} placeholder="Tell us about your loan needs..." defaultValue={""} />
            </div>
            <button className="w-full inline-flex py-4 px-6 items-center justify-center text-lg font-medium text-black hover:text-white border border-lime-500 hover:border-teal-900 bg-lime-500 hover:bg-teal-900 rounded-full transition duration-200" type="submit">SUBMIT APPLICATION</button>
          </form>
        </div>
      </div>
    </div>
  </section>
</div>


    );
};

export default HowToApplySectionCustomComponents3;
