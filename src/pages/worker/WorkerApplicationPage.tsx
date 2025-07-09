import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Loader2,
  X,
} from 'lucide-react';
import { workerService, WorkerApplicationData, WorkerApplication } from '../../services/workerService';
import { serviceService, ServiceCategory } from '../../services/serviceService';

const WorkerApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingApplication, setExistingApplication] = useState<WorkerApplication | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);

  const [formData, setFormData] = useState<WorkerApplicationData & {
    idDocument: File | null;
    certifications: File[];
  }>({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',

    // Professional Information
    services: [],
    experience: '',
    hourlyRate: '',
    availability: [],
    bio: '',

    // Documents
    idDocument: null,
    certifications: [],

    // Background Check
    hasConvictions: false,
    convictionDetails: ''
  });

  const [uploadedDocuments, setUploadedDocuments] = useState({
    idDocument: null as { url: string; originalName: string } | null,
    certifications: [] as Array<{ url: string; originalName: string; name: string }>
  });

  const availabilityOptions = [
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ];

  // Load existing application and service categories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load service categories
        const categoriesResponse = await serviceService.getServiceCategories();
        if (categoriesResponse.success) {
          setServiceCategories(categoriesResponse.data);
        }

        // Try to load existing application
        try {
          const applicationResponse = await workerService.getMyApplication();
          if (applicationResponse.success) {
            const app = applicationResponse.data;
            setExistingApplication(app);

            // Pre-fill form with existing data
            setFormData(prev => ({
              ...prev,
              firstName: app.firstName || '',
              lastName: app.lastName || '',
              email: app.email || '',
              phone: app.phone || '',
              address: app.address || '',
              services: app.services || [],
              experience: app.experience || '',
              hourlyRate: app.hourlyRate?.toString() || '',
              availability: app.availability || [],
              bio: app.bio || '',
              hasConvictions: app.backgroundCheck?.hasConvictions || false,
              convictionDetails: app.backgroundCheck?.convictionDetails || ''
            }));

            // Set uploaded documents
            if (app.documents?.idDocument) {
              setUploadedDocuments(prev => ({
                ...prev,
                idDocument: {
                  url: app.documents.idDocument!.url,
                  originalName: app.documents.idDocument!.originalName
                }
              }));
            }

            if (app.documents?.certifications) {
              setUploadedDocuments(prev => ({
                ...prev,
                certifications: app.documents.certifications.map(cert => ({
                  url: cert.url,
                  originalName: cert.originalName,
                  name: cert.name
                }))
              }));
            }
          }
        } catch (appError) {
          // No existing application found, which is fine for new applications
          console.log('No existing application found');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load application data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const handleFileUpload = async (field: 'idDocument' | 'certifications', file: File) => {
    try {
      setLoading(true);
      setError(null);

      const documentType = field === 'idDocument' ? 'idDocument' : 'certification';
      const response = await workerService.uploadDocument(file, documentType);

      if (response.success) {
        if (field === 'idDocument') {
          setUploadedDocuments(prev => ({
            ...prev,
            idDocument: {
              url: response.data.url,
              originalName: response.data.originalName
            }
          }));
          setFormData(prev => ({ ...prev, idDocument: file }));
        } else {
          setUploadedDocuments(prev => ({
            ...prev,
            certifications: [
              ...prev.certifications,
              {
                url: response.data.url,
                originalName: response.data.originalName,
                name: file.name.split('.')[0]
              }
            ]
          }));
          setFormData(prev => ({
            ...prev,
            certifications: [...prev.certifications, file]
          }));
        }
        setSuccess('Document uploaded successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError(null);

      // Validate required documents
      if (!uploadedDocuments.idDocument) {
        setError('ID document is required before submission');
        return;
      }

      // Submit application for review
      const response = await workerService.submitForReview();

      if (response.success) {
        setSuccess('Application submitted successfully! We will review your application and get back to you within 2-3 business days.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      const applicationData: WorkerApplicationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        services: formData.services,
        experience: formData.experience,
        hourlyRate: formData.hourlyRate,
        availability: formData.availability,
        bio: formData.bio,
        hasConvictions: formData.hasConvictions,
        convictionDetails: formData.convictionDetails
      };

      let response;
      if (existingApplication) {
        response = await workerService.updateApplication(applicationData);
      } else {
        response = await workerService.submitApplication(applicationData);
        // Reload application data after creation
        const newApp = await workerService.getMyApplication();
        if (newApp.success) {
          setExistingApplication(newApp.data);
        }
      }

      if (response.success) {
        setSuccess('Progress saved successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save progress');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1 || currentStep === 2) {
      await saveProgress();
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const clearMessage = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading && !existingApplication) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a HandyHub Worker</h1>
          <p className="text-xl text-gray-600">Join our network of trusted professionals</p>
          {existingApplication && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Status: {existingApplication.applicationStatus.charAt(0).toUpperCase() + existingApplication.applicationStatus.slice(1)}
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {(error || success) && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            }`}>
            <div className="flex items-center">
              {error ? (
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              )}
              <span className={error ? 'text-red-800' : 'text-green-800'}>
                {error || success}
              </span>
            </div>
            <button onClick={clearMessage} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                  }`}>
                  {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-2 mx-4 rounded ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
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
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                    Services You Offer * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {serviceCategories.map(category => (
                      <label key={category.name} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(category.name)}
                          onChange={() => handleServiceToggle(category.name)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-900">{category.label}</span>
                          <p className="text-xs text-gray-500">{category.description}</p>
                        </div>
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
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
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
                    Availability * (Select all that apply)
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
                    Professional Bio * (Minimum 50 characters)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about your experience, skills, and what makes you a great service provider..."
                    required
                    minLength={50}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length}/50 characters minimum
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
                      onChange={(e) => e.target.files && handleFileUpload('idDocument', e.target.files[0])}
                      className="hidden"
                      id="id-upload"
                    />
                    <label htmlFor="id-upload" className="cursor-pointer">
                      <span className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Choose File
                      </span>
                    </label>
                    {uploadedDocuments.idDocument && (
                      <p className="mt-2 text-sm text-green-600">✓ {uploadedDocuments.idDocument.originalName}</p>
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
                    <p className="text-sm text-gray-500">Multiple files allowed</p>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => e.target.files && handleFileUpload('certifications', e.target.files[0])}
                      className="hidden"
                      id="cert-upload"
                    />
                    <label htmlFor="cert-upload" className="cursor-pointer">
                      <span className="mt-2 inline-block bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                        Choose Files
                      </span>
                    </label>
                    {uploadedDocuments.certifications.length > 0 && (
                      <div className="mt-2">
                        {uploadedDocuments.certifications.map((cert, index) => (
                          <p key={index} className="text-sm text-green-600">✓ {cert.originalName}</p>
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
                            onChange={(e) => setFormData({ ...formData, hasConvictions: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                          />
                          <span className="ml-2 text-sm text-yellow-800">
                            I have been convicted of a crime in the past 7 years
                          </span>
                        </label>

                        {formData.hasConvictions && (
                          <textarea
                            value={formData.convictionDetails}
                            onChange={(e) => setFormData({ ...formData, convictionDetails: e.target.value })}
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
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Documents</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      {uploadedDocuments.idDocument ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span>Government ID uploaded: {uploadedDocuments.idDocument.originalName}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                          <span className="text-red-600">Government ID required</span>
                        </>
                      )}
                    </div>
                    {uploadedDocuments.certifications.length > 0 && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span>{uploadedDocuments.certifications.length} certification(s) uploaded</span>
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
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitLoading || !uploadedDocuments.idDocument}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerApplicationPage;