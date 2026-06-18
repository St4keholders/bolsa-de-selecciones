"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Partner } from "@/lib/types";

interface UsePartnerReturn {
  partner: Partner | null;
  partnerId: string | null;
  isLoading: boolean;
  refresh: () => void;
}

export function usePartner(userId: string): UsePartnerReturn {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchPartner = useCallback(async () => {
    setIsLoading(true);

    // Step 1: get the user's partner_id
    const { data: user } = await supabase
      .from("usuarios")
      .select("partner_id")
      .eq("id", userId)
      .single();

    if (!user || !user.partner_id) {
      setPartnerId(null);
      setPartner(null);
      setIsLoading(false);
      return;
    }

    setPartnerId(user.partner_id);

    // Step 2: fetch the full partner record
    const { data: partnerData } = await supabase
      .from("partners")
      .select("*")
      .eq("id", user.partner_id)
      .single();

    if (partnerData) {
      setPartner(partnerData as Partner);
    }

    setIsLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    fetchPartner();
  }, [fetchPartner]);

  return { partner, partnerId, isLoading, refresh: fetchPartner };
}
