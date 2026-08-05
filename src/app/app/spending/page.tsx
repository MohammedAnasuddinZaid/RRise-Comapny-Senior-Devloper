"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Plus, Trash2, DollarSign, Wallet, PieChart, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireAuth } from "../../../lib/authGuard";
import { loadSpendingData, createSpendingTransaction, deleteSpendingTransaction } from "../../../lib/dataLoader";

export default function SpendingPage() {
  const { user, loading } = useRequireAuth();
  const [spending, setSpending] = useState<{
    currency: string;
    totalSpent: number;
    budget: number;
    recentTransactions: Array<{ id: string; title: string; amount: number; date: string }>;
    categories: Array<{ name: string; amount: number; color: string }>;
  }>({
    currency: "$",
    totalSpent: 0,
    budget: 100,
    recentTransactions: [],
    categories: [
      { name: "Food", amount: 0, color: "#00ff87" },
      { name: "Transport", amount: 0, color: "#00e5ff" },
      { name: "Entertainment", amount: 0, color: "#ff6b6b" },
      { name: "Shopping", amount: 0, color: "#ffd93d" },
    ],
  });
  const [newTxTitle, setNewTxTitle] = useState("");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxCategory, setNewTxCategory] = useState("Food");
  const [dataLoading, setDataLoading] = useState(true);

  // Load spending data from Supabase
  useEffect(() => {
    async function fetchSpendingData() {
      if (!user) return;

      setDataLoading(true);
      try {
        const data = await loadSpendingData(user.id);
        setSpending(data);
      } catch (error) {
        console.error('Error loading spending data:', error);
      } finally {
        setDataLoading(false);
      }
    }

    fetchSpendingData();
  }, [user]);

  // Show loading state
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newTxAmount);
    if (!newTxTitle.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !user) return;

    const result = await createSpendingTransaction(user.id, newTxTitle, parsedAmount, newTxCategory);
    if (result.success) {
      // Refresh spending data
      const data = await loadSpendingData(user.id);
      setSpending(data);
      setNewTxTitle("");
      setNewTxAmount("");
    } else {
      console.error('Failed to create transaction:', result.error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;

    const result = await deleteSpendingTransaction(id, user.id);
    if (result.success) {
      // Refresh spending data
      const data = await loadSpendingData(user.id);
      setSpending(data);
    } else {
      console.error('Failed to delete transaction:', result.error);
    }
  };

  const remainingBudget = Math.max(0, spending.budget - spending.totalSpent);

  return (
    <div className="space-y-10 pb-12 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="font-playfair text-4xl font-bold tracking-tight">Wealth Architect</h1>
        <p className="text-muted-foreground font-light">
          Track details, reduce friction, and manage your resources with clarity.
        </p>
      </div>

      {/* Financial Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg- border-border">
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-sm font-medium uppercase tracking-wider">Total Spent</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="font-playfair text-4xl font-bold">
                {spending.currency}{spending.totalSpent.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Out of {spending.currency}{spending.budget.toFixed(2)} limit
              </p>
            </div>
            <ProgressBar value={spending.totalSpent} max={spending.budget} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg- border-border">
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-sm font-medium uppercase tracking-wider">Remaining Budget</span>
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-playfair text-4xl font-bold">
                {spending.currency}{remainingBudget.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Available to allocate or save
              </p>
            </div>
            <ProgressBar value={remainingBudget} max={spending.budget} indicatorClassName="bg-emerald-500" className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg- border-border">
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-sm font-medium uppercase tracking-wider">Daily Average</span>
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-playfair text-4xl font-bold">
                {spending.currency}{(spending.totalSpent / 7).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Smoothed weekly expenditure rate
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>Stable relative to last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Expense Form and Categories */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-xl">Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Expense Item</label>
                  <input
                    type="text"
                    value={newTxTitle}
                    onChange={(e) => setNewTxTitle(e.target.value)}
                    placeholder="e.g. 'Coffee', 'Gym'"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount ({spending.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTxAmount}
                    onChange={(e) => setNewTxAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</label>
                  <select
                    value={newTxCategory}
                    onChange={(e) => setNewTxCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors text-foreground"
                  >
                    {spending.categories.map((cat) => (
                      <option key={cat.name} value={cat.name} className="bg-background">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full rounded-xl py-3.5 mt-2">
                  <Plus className="w-4 h-4 mr-2" /> Log Expense
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Categories card */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-xl">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {spending.categories.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-muted-foreground">
                      {spending.currency}{cat.amount.toFixed(2)}
                    </span>
                  </div>
                  <ProgressBar value={cat.amount} max={spending.totalSpent || 100} indicatorClassName={`bg-[${cat.color}]`} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <div className="md:col-span-2">
          <Card className="bg-surface border-border h-full">
            <CardHeader className="border-b border-border pb-6">
              <CardTitle className="text-xl">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <AnimatePresence initial={false}>
                  {spending.recentTransactions.map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between p-6 hover:bg-surface-hover transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-base text-foreground/90">{tx.title}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">{tx.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-base">
                          -{spending.currency}{tx.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(tx.id)}
                          className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {spending.recentTransactions.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground font-light">
                    No transactions logged. You're well under budget.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
