"use client";

import { useState } from 'react'
import { Star, MapPin, ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "@/components/ui/dialog"

interface HostelProfileProps {
hostel?: {
  id: number;
  name: string;
  rating: number;
  location: string;
  capacity: number;
  image: string;
  description: string;
  facilities: string[];
  rooms: {
    name: string;
    beds: number;
    price: number;
    available: boolean;
    image: string;
  }[];
};
}

const bookingFormSchema = z.object({
name: z.string().min(2, "Name must be at least 2 characters"),
address: z.string().min(5, "Address must be at least 5 characters"),
cnic: z.string().regex(/^\d{13}$/, "CNIC must be 13 digits"),
phone: z.string().regex(/^\+92\d{10}$/, "Phone number must be in the format +92xxxxxxxxxx"),
checkInDate: z.date({
  required_error: "Check-in date is required",
}),
checkOutDate: z.date({
  required_error: "Check-out date is required",
}),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface Room {
name: string;
beds: number;
price: number;
available: boolean;
image: string;
}

export default function HostelProfile({ hostel }: HostelProfileProps) {
const [currentImageIndex, setCurrentImageIndex] = useState(0);
const [showBookingForm, setShowBookingForm] = useState(false);
const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
const [bookingStep, setBookingStep] = useState(1);
const [showCancellationDialog, setShowCancellationDialog] = useState(false);
const [cancellationReason, setCancellationReason] = useState("");

const { control, handleSubmit, getValues, formState: { errors } } = useForm<BookingFormData>({
  resolver: zodResolver(bookingFormSchema),
});

const rooms: Room[] = hostel?.rooms || [];

const nextImage = () => {
  setCurrentImageIndex((prevIndex) => (prevIndex + 1) % rooms.length);
};

const prevImage = () => {
  setCurrentImageIndex((prevIndex) => (prevIndex - 1 + rooms.length) % rooms.length);
};

const handleBookNow = (room: Room) => {
  if (room.available) {
    setSelectedRoom(room);
    setShowBookingForm(true);
    setBookingStep(1);
  }
};

const onSubmit = (data: BookingFormData) => {
  console.log(data);
  setBookingStep(2);
};

const handleBack = () => {
  setBookingStep(1);
};

const handleConfirmBooking = () => {
  console.log("Booking request sent to hostel owner");
  toast({
    title: "Booking Request Sent",
    description: "Your booking request has been sent to the hostel owner.",
  });
  setShowBookingForm(false);
  setBookingStep(1);
};

const handleCancelBooking = () => {
  setShowCancellationDialog(true);
};

const handleConfirmCancellation = () => {
  console.log("Booking cancelled. Reason:", cancellationReason);
  toast({
    title: "Booking Cancelled",
    description: "Your booking has been successfully cancelled.",
    variant: "destructive",
  });
  setShowCancellationDialog(false);
  setShowBookingForm(false);
  setBookingStep(1);
  setCancellationReason("");
};

if (!hostel) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">Hostel Not Found</h1>
          <p>Sorry, we couldn't find the hostel you're looking for.</p>
          <Link href="/" className="mt-4 inline-block">
            <Button>Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

return (
  <div className="min-h-screen bg-background p-6">
    <div className="max-w-6xl mx-auto">
      {/* Image Gallery */}
      <div className="relative mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2 relative aspect-[4/3]">
            <Image
              src={hostel.image}
              alt="Hostel lounge"
              className="rounded-l-xl object-cover"
              fill
            />
          </div>
          <div className="col-span-1 relative aspect-[4/3]">
            <Image
              src="/placeholder.svg"
              alt="Hostel terrace"
              className="object-cover"
              fill
            />
          </div>
          <div className="col-span-1 relative aspect-[4/3]">
            <Image
              src="/placeholder.svg"
              alt="Hostel facilities"
              className="rounded-r-xl object-cover"
              fill
            />
          </div>
        </div>
      </div>

      {/* Hostel Info */}
      <div>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{hostel.name}</h1>
            <p className="text-muted-foreground mt-2">{hostel.location}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center mb-1">
              <Star className="w-4 h-4 fill-primary text-primary mr-1" />
              <span className="font-bold">{hostel.rating}</span>
            </div>
            <div className="text-sm text-muted-foreground">Superb (10494)</div>
          </div>
        </div>

        {/* Facilities */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hostel.facilities.map((facility, index) => (
                <span key={index}>{facility}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="rooms" className="mb-6">
          <TabsList>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {rooms.map((room, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="relative aspect-video">
                            <Image src={room.image} alt={room.name} fill className="rounded-lg object-cover" />
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute left-2 top-1/2 -translate-y-1/2"
                              onClick={prevImage}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={nextImage}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-col justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {room.beds === 1 ? 'Private room' : 'Shared room'} • {room.beds} bed{room.beds > 1 ? 's' : ''}
                              </p>
                              <p className="font-semibold text-lg mb-2">PKR {room.price.toLocaleString()} per bed/month</p>
                              <Badge variant={room.available ? "default" : "destructive"} className="mb-2">
                                {room.available ? (
                                  <><CheckCircle className="w-4 h-4 mr-1" /> Available</>
                                ) : (
                                  <><XCircle className="w-4 h-4 mr-1" /> Not Available</>
                                )}
                              </Badge>
                            </div>
                            <Button 
                              className="w-full md:w-auto" 
                              onClick={() => handleBookNow(room)}
                              disabled={!room.available}
                            >
                              {room.available ? "Book Now" : "Not Available"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Booking Form */}
              {showBookingForm && selectedRoom && (
                <Card className="sticky top-6">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Book {selectedRoom.name}</h2>
                    {bookingStep === 1 ? (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Controller
                            name="name"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Controller
                            name="address"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cnic">CNIC Number</Label>
                          <Controller
                            name="cnic"
                            control={control}
                            render={({ field }) => <Input {...field} placeholder="13 digits without spaces" />}
                          />
                          {errors.cnic && <p className="text-red-500 text-sm mt-1">{errors.cnic.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => <Input {...field} placeholder="+92xxxxxxxxxx" />}
                          />
                          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="checkInDate">Check-in Date</Label>
                          <Controller
                            name="checkInDate"
                            control={control}
                            render={({ field }) => (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    }`}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            )}
                          />
                          {errors.checkInDate && <p className="text-red-500 text-sm mt-1">{errors.checkInDate.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor="checkOutDate">Check-out Date</Label>
                          <Controller
                            name="checkOutDate"
                            control={control}
                            render={({ field }) => (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    }`}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            )}
                          />
                          {errors.checkOutDate && <p className="text-red-500 text-sm mt-1">{errors.checkOutDate.message}</p>}
                        </div>
                        <Button type="submit">Continue to Summary</Button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Booking Summary</h3>
                        <div>
                          <p><strong>Name:</strong> {getValues().name}</p>
                          <p><strong>Address:</strong> {getValues().address}</p>
                          <p><strong>CNIC:</strong> {getValues().cnic}</p>
                          <p><strong>Phone:</strong> {getValues().phone}</p>
                          <p><strong>Check-in Date:</strong> {getValues().checkInDate ? format(getValues().checkInDate, "PPP") : 'Not selected'}</p>
                          <p><strong>Check-out Date:</strong> {getValues().checkOutDate ? format(getValues().checkOutDate, "PPP") : 'Not selected'}</p>
                          <p><strong>Room:</strong> {selectedRoom.name}</p>
                          <p><strong>Price:</strong> PKR {selectedRoom.price.toLocaleString()} per bed/month</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={handleConfirmBooking}>Request Booking</Button>
                          <Button variant="outline" onClick={handleBack}>Back</Button>
                          <Button variant="destructive" onClick={handleCancelBooking}>Cancel Booking</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <Link 
                  href={`https://www.google.com/maps?q=${hostel.location}`}
                  target="_blank"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <MapPin className="w-4 h-4" />
                  View on Google Maps
                </Link>
                <div className="mt-4 aspect-video relative">
                  <Image
                    src="/placeholder.svg"
                    alt="Map location"
                    fill
                    className="rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <span>Cleanliness</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-[100px]" />
                        <span className="w-8 text-right">9.2</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Location</span>
                      <div className="flex items-center gap-2">
                        <Progress value={95} className="w-[100px]" />
                        <span className="w-8 text-right">9.5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Staff</span>
                      <div className="flex items-center gap-2">
                        <Progress value={88} className="w-[100px]" />
                        <span className="w-8 text-right">8.8</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div className="font-semibold">Alex from USA</div>
                        <div className="text-sm text-muted-foreground">2 days ago</div>
                      </div>
                      <p className="text-sm">Great location and amazing atmosphere! The staff was super friendly and helpful.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div className="font-semibold">Maria from Spain</div>
                        <div className="text-sm text-muted-foreground">1 week ago</div>
                      </div>
                      <p className="text-sm">Perfect place to meet other travelers. The common areas are really nice.</p>
                    </div>
                  </div>

                  {/* Feedback and Rating Section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Leave Your Feedback</h3>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="rating">Rating</Label>
                        <select id="rating" className="w-full mt-1 rounded-md border-gray-300">
                          <option>5 - Excellent</option>
                          <option>4 - Very Good</option>
                          <option>3 - Average</option>
                          <option>2 - Poor</option>
                          <option>1 - Terrible</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="feedback">Your Feedback</Label>
                        <Textarea id="feedback" placeholder="Share your experience..." className="mt-1" />
                      </div>
                      <Button type="submit">Submit Review</Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancellation Dialog */}
      <Dialog open={showCancellationDialog} onOpenChange={setShowCancellationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking? Please provide a reason for cancellation.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Reason for cancellation"
            className="mt-4"
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowCancellationDialog(false)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancellation}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
)
}
