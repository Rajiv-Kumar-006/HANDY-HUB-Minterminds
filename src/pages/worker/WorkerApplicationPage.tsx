import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Upload,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';

// Base URL for API (use environment variable in production)
const API_BASE_URL =  'http://localhost:5000/api';

const WorkerApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    services: [] as string[],
    experience: '',
    hourlyRate: '',
    availability: [] as string[],
    bio: '',
    idDocument: null as File | null,
    certifications: [] as File[],
    hasConvictions: false,
    convictionDetails: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    'House Cleaning',
    'Deep Cleaning',
    'Office Cleaning',
    'Plumbing',
    'Electrical',
    'Gardening',
    'Handyman',
    'Painting',
    'Cooking',
    'Laundry',
    'Automotive'
  ];

  const availabilityOptions = [
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ];

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleAvailabilityToggle = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(slot)
        ? prev.availability.filter(s => s !== slot)
        : [...prev.availability, slot]
    }));
  };

  const handleFileUpload = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.files![0]
      }));
    }
  };

  const handleCertificationsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        certifications: Array.from(e.target.files!)
      }));
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    // Client-side validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address) {
      setError('Please fill in all required personal information');
      setIsSubmitting(false);
      return;
    }
    if (!formData.services.length) {
      setError('Please select at least one service');
      setIsSubmitting(false);
      return;
    }
    if (!formData.experience) {
      setError('Please select your years of experience');
      setIsSubmitting(false);
      return;
    }
    if (!formData.hourlyRate || isNaN(Number(formData.hourlyRate)) || Number(formData.hourlyRate) < 10 || Number(formData.hourlyRate) > 200) {
      setError('Please enter a valid hourly rate between 10 and 200');
      setIsSubmitting(false);
      return;
    }
    if (!formData.availability.length) {
      setError('Please select at least one availability slot');
      setIsSubmitting(false);
      return;
    }
    if (!formData.bio || formData.bio.length < 10 || formData.bio.length > 500) {
      setError('Please provide a professional bio between 50 and 500 characters');
      setIsSubmitting(false);
      return;
    }
    if (!formData.idDocument) {
      setError('Please upload a government ID');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare payload with correct types
      const payload = {
        ...formData,
        hourlyRate: Number(formData.hourlyRate),
        idDocument: undefined,
        certifications: undefined,
      };

      // Submit application data
      await axios.post(`${API_BASE_URL}/workers/apply`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Upload documents
      const formDataUpload = new FormData();
      if (formData.idDocument) {
        formDataUpload.append('documents', formData.idDocument);
        formDataUpload.append('documentType', 'idDocument');
        await axios.post(`${API_BASE_URL}/workers/documents`, formDataUpload, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (formData.certifications.length > 0) {
        const certFormData = new FormData();
        formData.certifications.forEach(file => certFormData.append('documents', file));
        certFormData.append('documentType', 'certification');
        await axios.post(`${API_BASE_URL}/workers/documents`, certFormData, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Submit for review
      const response = await axios.put(`${API_BASE_URL}/workers/submit`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert(response.data.message);
      navigate('/');
    } catch (error: any) {
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Submission failed. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      // Basic validation before moving to next step
      if (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address)) {
        setError('Please fill in all required personal information before proceeding');
        return;
      }
      if (currentStep === 2 && (!formData.services.length || !formData.experience || !formData.hourlyRate || !formData.availability.length || !formData.bio || formData.bio.length < 10 || formData.bio.length > 500)) {
        setError('Please complete all required professional information before proceeding');
        return;
      }
      if (currentStep === 3 && !formData.idDocument) {
        setError('Please upload a government ID before proceeding');
        return;
      }
      setError('');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setError('');
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a HandyHub Worker</h1>
          <p className="text-xl text-gray-600">Join our network of trusted professionals</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-2 mx-4 rounded ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Personal Info</span>
            <span>Services</span>
            <span>Documents</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full address"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services & Professional Info */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Services & Professional Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Services You Offer * (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {services.map(service => (
                      <label key={service} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service)}
                          onChange={() => handleServiceToggle(service)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="25"
                        min="10"
                        max="200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Availability * (Select at least one)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {availabilityOptions.map(slot => (
                      <label key={slot} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.availability.includes(slot)}
                          onChange={() => handleAvailabilityToggle(slot)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{slot}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio * (10-500 characters)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about your experience, skills, and what makes you a great service provider..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents & Verification</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Government ID * (Driver's License, Passport, etc.)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileUpload('idDocument')}
                      className="hidden"
                      id="id-upload"
                    />
                    <label htmlFor="id-upload" className="cursor-pointer">
                      <span className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Choose File
                      </span>
                    </label>
                    {formData.idDocument && (
                      <p className="mt-2 text-sm text-green-600">✓ {formData.idDocument.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Certifications (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload any relevant certifications</p>
                    <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB each</p>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      multiple
                      onChange={handleCertificationsUpload}
                      className="hidden"
                      id="cert-upload"
                    />
                    <label htmlFor="cert-upload" className="cursor-pointer">
                      <span className="mt-2 inline-block bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                        Choose Files
                      </span>
                    </label>
                    {formData.certifications.length > 0 && (
                      <div className="mt-2">
                        {formData.certifications.map((file, index) => (
                          <p key={index} className="text-sm text-green-600">✓ {file.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-yellow-800 mb-2">Background Check Required</h3>
                      <div className="space-y-3">
                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            checked={formData.hasConvictions}
                            onChange={(e) => setFormData({...formData, hasConvictions: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                          />
                          <span className="ml-2 text-sm text-yellow-800">
                            I have been convicted of a crime in the past 7 years
                          </span>
                        </label>
                        
                        {formData.hasConvictions && (
                          <textarea
                            value={formData.convictionDetails}
                            onChange={(e) => setFormData({...formData, convictionDetails: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="Please provide details about your conviction(s)..."
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Application</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Name:</span> {formData.firstName} {formData.lastName}</div>
                    <div><span className="text-gray-600">Email:</span> {formData.email}</div>
                    <div><span className="text-gray-600">Phone:</span> {formData.phone}</div>
                    <div><span className="text-gray-600">Address:</span> {formData.address}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Professional Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Services:</span> {formData.services.join(', ')}</div>
                    <div><span className="text-gray-600">Experience:</span> {formData.experience} years</div>
                    <div><span className="text-gray-600">Hourly Rate:</span> ${formData.hourlyRate}/hour</div>
                    <div><span className="text-gray-600">Availability:</span> {formData.availability.length} time slots</div>
                    <div><span className="text-gray-600">Bio:</span> {formData.bio}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
                  <div className="space-y-2 text-sm">
                    {formData.idDocument ? (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>Government ID: {formData.idDocument.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span>Government ID not uploaded</span>
                      </div>
                    )}
                    {formData.certifications.length > 0 && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>{formData.certifications.length} certification(s) uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Next Steps</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• We'll review your application within 2-3 business days</li>
                    <li>• Background check will be conducted</li>
                    <li>• You'll receive an email with the decision</li>
                    <li>• If approved, you can start accepting bookings immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerApplicationPage;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   User, 
//   Mail, 
//   Phone, 
//   MapPin, 
//   FileText, 
//   Upload,
//   CheckCircle,
//   AlertCircle,
//   DollarSign,
//   Clock
// } from 'lucide-react';

// const WorkerApplicationPage: React.FC = () => {
//   const navigate = useNavigate();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     // Personal Information
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     address: '',
    
//     // Professional Information
//     services: [] as string[],
//     experience: '',
//     hourlyRate: '',
//     availability: [] as string[],
//     bio: '',
    
//     // Documents
//     idDocument: null as File | null,
//     certifications: [] as File[],
    
//     // Background Check
//     hasConvictions: false,
//     convictionDetails: ''
//   });

//   const services = [
//     'House Cleaning', 'Deep Cleaning', 'Office Cleaning',
//     'Plumbing', 'Electrical Work', 'HVAC',
//     'Gardening', 'Landscaping', 'Lawn Care',
//     'Handyman Services', 'Furniture Assembly', 'Painting',
//     'Cooking', 'Meal Prep', 'Catering',
//     'Pet Care', 'House Sitting', 'Elderly Care'
//   ];

//   const availabilityOptions = [
//     'Monday Morning', 'Monday Afternoon', 'Monday Evening',
//     'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
//     'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
//     'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
//     'Friday Morning', 'Friday Afternoon', 'Friday Evening',
//     'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
//     'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
//   ];

//   const handleServiceToggle = (service: string) => {
//     setFormData(prev => ({
//       ...prev,
//       services: prev.services.includes(service)
//         ? prev.services.filter(s => s !== service)
//         : [...prev.services, service]
//     }));
//   };

//   const handleAvailabilityToggle = (slot: string) => {
//     setFormData(prev => ({
//       ...prev,
//       availability: prev.availability.includes(slot)
//         ? prev.availability.filter(s => s !== slot)
//         : [...prev.availability, slot]
//     }));
//   };

//   const handleFileUpload = (field: string, file: File) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: file
//     }));
//   };

//   const handleSubmit = async () => {
//     // Simulate API submission
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     alert('Application submitted successfully! We will review your application and get back to you within 2-3 business days.');
//     navigate('/');
//   };

//   const nextStep = () => {
//     if (currentStep < 4) setCurrentStep(currentStep + 1);
//   };

//   const prevStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a HandyHub Worker</h1>
//           <p className="text-xl text-gray-600">Join our network of trusted professionals</p>
//         </div>

//         {/* Progress Bar */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             {[1, 2, 3, 4].map(step => (
//               <div key={step} className="flex items-center">
//                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
//                   step <= currentStep 
//                     ? 'bg-blue-600 text-white' 
//                     : 'bg-gray-200 text-gray-600'
//                 }`}>
//                   {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
//                 </div>
//                 {step < 4 && (
//                   <div className={`flex-1 h-2 mx-4 rounded ${
//                     step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
//                   }`} />
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-between mt-2 text-sm text-gray-600">
//             <span>Personal Info</span>
//             <span>Services</span>
//             <span>Documents</span>
//             <span>Review</span>
//           </div>
//         </div>

//         {/* Form Content */}
//         <div className="bg-white rounded-xl shadow-lg p-8">
//           {/* Step 1: Personal Information */}
//           {currentStep === 1 && (
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     First Name *
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       value={formData.firstName}
//                       onChange={(e) => setFormData({...formData, firstName: e.target.value})}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Enter your first name"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Last Name *
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       value={formData.lastName}
//                       onChange={(e) => setFormData({...formData, lastName: e.target.value})}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Enter your last name"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address *
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) => setFormData({...formData, email: e.target.value})}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Phone Number *
//                   </label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="tel"
//                       value={formData.phone}
//                       onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Enter your phone number"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Address *
//                   </label>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       value={formData.address}
//                       onChange={(e) => setFormData({...formData, address: e.target.value})}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Enter your full address"
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 2: Services & Professional Info */}
//           {currentStep === 2 && (
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Services & Professional Information</h2>
              
//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-3">
//                     Services You Offer * (Select all that apply)
//                   </label>
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                     {services.map(service => (
//                       <label key={service} className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={formData.services.includes(service)}
//                           onChange={() => handleServiceToggle(service)}
//                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         />
//                         <span className="ml-2 text-sm text-gray-700">{service}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Years of Experience *
//                     </label>
//                     <select
//                       value={formData.experience}
//                       onChange={(e) => setFormData({...formData, experience: e.target.value})}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     >
//                       <option value="">Select experience</option>
//                       <option value="0-1">0-1 years</option>
//                       <option value="1-3">1-3 years</option>
//                       <option value="3-5">3-5 years</option>
//                       <option value="5-10">5-10 years</option>
//                       <option value="10+">10+ years</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Hourly Rate (USD) *
//                     </label>
//                     <div className="relative">
//                       <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                       <input
//                         type="number"
//                         value={formData.hourlyRate}
//                         onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
//                         className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="25"
//                         min="10"
//                         max="200"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-3">
//                     Availability * (Select all that apply)
//                   </label>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
//                     {availabilityOptions.map(slot => (
//                       <label key={slot} className="flex items-center">
//                         <input
//                           type="checkbox"
//                           checked={formData.availability.includes(slot)}
//                           onChange={() => handleAvailabilityToggle(slot)}
//                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         />
//                         <span className="ml-2 text-sm text-gray-700">{slot}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Professional Bio *
//                   </label>
//                   <textarea
//                     value={formData.bio}
//                     onChange={(e) => setFormData({...formData, bio: e.target.value})}
//                     rows={4}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Tell us about your experience, skills, and what makes you a great service provider..."
//                     required
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 3: Documents */}
//           {currentStep === 3 && (
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents & Verification</h2>
              
//               <div className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Government ID * (Driver's License, Passport, etc.)
//                   </label>
//                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
//                     <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
//                     <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB</p>
//                     <input
//                       type="file"
//                       accept=".png,.jpg,.jpeg,.pdf"
//                       onChange={(e) => e.target.files && handleFileUpload('idDocument', e.target.files[0])}
//                       className="hidden"
//                       id="id-upload"
//                     />
//                     <label htmlFor="id-upload" className="cursor-pointer">
//                       <span className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
//                         Choose File
//                       </span>
//                     </label>
//                     {formData.idDocument && (
//                       <p className="mt-2 text-sm text-green-600">✓ {formData.idDocument.name}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Professional Certifications (Optional)
//                   </label>
//                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
//                     <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-gray-600 mb-2">Upload any relevant certifications</p>
//                     <p className="text-sm text-gray-500">Multiple files allowed</p>
//                     <input
//                       type="file"
//                       accept=".png,.jpg,.jpeg,.pdf"
//                       multiple
//                       onChange={(e) => {
//                         if (e.target.files) {
//                           setFormData(prev => ({
//                             ...prev,
//                             certifications: Array.from(e.target.files!)
//                           }));
//                         }
//                       }}
//                       className="hidden"
//                       id="cert-upload"
//                     />
//                     <label htmlFor="cert-upload" className="cursor-pointer">
//                       <span className="mt-2 inline-block bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
//                         Choose Files
//                       </span>
//                     </label>
//                     {formData.certifications.length > 0 && (
//                       <div className="mt-2">
//                         {formData.certifications.map((file, index) => (
//                           <p key={index} className="text-sm text-green-600">✓ {file.name}</p>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                   <div className="flex items-start">
//                     <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
//                     <div>
//                       <h3 className="font-medium text-yellow-800 mb-2">Background Check Required</h3>
//                       <div className="space-y-3">
//                         <label className="flex items-start">
//                           <input
//                             type="checkbox"
//                             checked={formData.hasConvictions}
//                             onChange={(e) => setFormData({...formData, hasConvictions: e.target.checked})}
//                             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
//                           />
//                           <span className="ml-2 text-sm text-yellow-800">
//                             I have been convicted of a crime in the past 7 years
//                           </span>
//                         </label>
                        
//                         {formData.hasConvictions && (
//                           <textarea
//                             value={formData.convictionDetails}
//                             onChange={(e) => setFormData({...formData, convictionDetails: e.target.value})}
//                             rows={3}
//                             className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                             placeholder="Please provide details about your conviction(s)..."
//                           />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 4: Review */}
//           {currentStep === 4 && (
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Application</h2>
              
//               <div className="space-y-6">
//                 <div className="bg-gray-50 rounded-lg p-6">
//                   <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <div><span className="text-gray-600">Name:</span> {formData.firstName} {formData.lastName}</div>
//                     <div><span className="text-gray-600">Email:</span> {formData.email}</div>
//                     <div><span className="text-gray-600">Phone:</span> {formData.phone}</div>
//                     <div><span className="text-gray-600">Address:</span> {formData.address}</div>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 rounded-lg p-6">
//                   <h3 className="font-semibold text-gray-900 mb-3">Professional Information</h3>
//                   <div className="space-y-2 text-sm">
//                     <div><span className="text-gray-600">Services:</span> {formData.services.join(', ')}</div>
//                     <div><span className="text-gray-600">Experience:</span> {formData.experience} years</div>
//                     <div><span className="text-gray-600">Hourly Rate:</span> ${formData.hourlyRate}/hour</div>
//                     <div><span className="text-gray-600">Availability:</span> {formData.availability.length} time slots</div>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 rounded-lg p-6">
//                   <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex items-center">
//                       <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
//                       <span>Government ID uploaded</span>
//                     </div>
//                     {formData.certifications.length > 0 && (
//                       <div className="flex items-center">
//                         <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
//                         <span>{formData.certifications.length} certification(s) uploaded</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <h3 className="font-medium text-blue-800 mb-2">Next Steps</h3>
//                   <ul className="text-sm text-blue-700 space-y-1">
//                     <li>• We'll review your application within 2-3 business days</li>
//                     <li>• Background check will be conducted</li>
//                     <li>• You'll receive an email with the decision</li>
//                     <li>• If approved, you can start accepting bookings immediately</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Navigation Buttons */}
//           <div className="flex justify-between mt-8">
//             <button
//               onClick={prevStep}
//               disabled={currentStep === 1}
//               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Previous
//             </button>
            
//             {currentStep < 4 ? (
//               <button
//                 onClick={nextStep}
//                 className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200"
//               >
//                 Next
//               </button>
//             ) : (
//               <button
//                 onClick={handleSubmit}
//                 className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200"
//               >
//                 Submit Application
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WorkerApplicationPage;