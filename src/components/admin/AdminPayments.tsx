"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { createPayment } from '@/action/user';
import { ArtistPayment, Payment } from '@/lib/type';
import { CreditCard, IndianRupee, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import NailLoader from '../NailLoader';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';


const AdminPayments = ({ artists, payments }: { artists: ArtistPayment[], payments: Payment[] }) => {
  const [selectedArtist, setSelectedArtist] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [showPaymentSlip, setShowPaymentSlip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCreatePaymentSlip = async (artistId: string) => {
    const artist = artists.find(artist => artist.id === artistId);
    if (!artist || !paymentAmount) return;
    if(parseFloat(paymentAmount) > artist.due) {
      toast.error("Payment amount cannot be greater than the amount due");
      return;
    }
    setIsLoading(true);
    const slipData = {
      artist_id: artistId,
      amount: parseFloat(paymentAmount),
      notes: notes,
    };
    const { error } = await createPayment(slipData);
    if(error) {
      toast.error(error);
    }
    setNotes('');
    setShowPaymentSlip(true);
    setSelectedArtist('');
    setPaymentAmount('');
    setIsLoading(false);
  };

  const totalAmountOwed = artists.reduce((sum, artist) => sum + artist.due, 0);
  const totalArtists = artists.length;
  if(isLoading) {
    return <NailLoader />
  }
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Payment Management</h1>
          <p className="text-gray-600">Manage artist payments and create payment slips</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount Owed</p>
                  <p className="text-2xl font-bold text-red-600">{totalAmountOwed}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Artists</p>
                  <p className="text-2xl font-bold text-blue-600">{totalArtists}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Artists List */}
        <Card className="bg-white shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Artists & Amount Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artist</TableHead>
                  <TableHead>UPI ID</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artists.map(artist => (
                  <TableRow key={artist.id}>
                    <TableCell className="font-medium">{artist.name}</TableCell>
                    <TableCell className="text-gray-600">{artist.upi_id}</TableCell>
                    <TableCell>
                      <span className="text-lg font-bold text-red-600">{artist.due}</span>
                      <span className="text-sm text-gray-500 ml-1">₹</span>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setSelectedArtist(artist.id.toString())}
                          >
                            Create Slip
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Create Payment Slip for {artist.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600">Amount Due:</p>
                              <p className="text-2xl font-bold text-red-600">{artist.due}₹</p>
                            </div>
                            
                            <div>
                              <Label htmlFor="amount" className='my-2'>Payment Amount</Label>
                              <Input
                                id="amount"
                                type="number"
                                placeholder="Enter amount"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                              />
                            </div>

                            <div>
                              <Label htmlFor="notes" className='my-2'>Notes (Optional)</Label>
                              <Textarea
                                id="notes"
                                placeholder="Add any additional notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              />
                            </div>

                            <Button 
                              onClick={() => handleCreatePaymentSlip(artist.id)}
                              className="w-full"
                              disabled={!paymentAmount}
                            >
                              Generate Payment Slip
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* All Payments List */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              All Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artist</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.name}</TableCell>
                    <TableCell>
                      <span className="text-lg font-semibold text-green-600">{payment.amount}</span>
                    </TableCell>
                    <TableCell className="text-gray-600">{format(new Date(payment.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      {payment.notes ? <span className="text-gray-500">{payment.notes}</span> : <span className="text-gray-500">No notes</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPayments;
