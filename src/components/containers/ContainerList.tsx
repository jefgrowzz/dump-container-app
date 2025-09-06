// src/components/containers/ContainerList.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Container {
  id: string;
  title?: string;
  description?: string;
  size?: string;
  price: number;
  image_url?: string;
  available: boolean;
  location?: string;
  address?: string;
  available_date?: string;
  created_at?: string;
}

interface ContainerListProps {
  onContainerSelect?: (container: Container) => void;
  onBookContainer?: (container: Container) => void;
  filters?: any;
}

export default function ContainerList({ onContainerSelect, onBookContainer, filters }: ContainerListProps) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let channelOrSub: any = null;

    const fetchContainers = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("containers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching containers:", error);
        if (mounted) setContainers([]);
      } else {
        const mappedData = (data || []).map((c: any) => ({
          id: String(c.id),
          title: c.title,
          description: c.description,
          size: c.size,
          price: Number(c.price ?? 0),
          image_url: c.image_url,
          available: (c.is_available ?? c.available ?? true) === true || c.is_available === "true",
          location: c.location,
          address: c.address,
          available_date: c.available_date,
          created_at: c.created_at,
        }));
        if (mounted) setContainers(mappedData);
      }

      if (mounted) setLoading(false);
    };

    // Realtime subscriptions setup (same as your original)

    const setupRealtime = async () => {
      try {
        if (typeof (supabase as any).channel === "function") {
          const channel = (supabase as any)
            .channel("public:containers")
            .on(
              "postgres_changes",
              { event: "INSERT", schema: "public", table: "containers" },
              (payload: any) => {
                const newRow = {
                  ...payload.new,
                  id: String(payload.new.id),
                  available: payload.new.is_available ?? true,
                };
                setContainers((prev) => [newRow, ...prev]);
              }
            )
            .on(
              "postgres_changes",
              { event: "UPDATE", schema: "public", table: "containers" },
              (payload: any) => {
                setContainers((prev) =>
                  prev.map((c) =>
                    c.id === String(payload.new.id)
                      ? { ...payload.new, id: String(payload.new.id), available: payload.new.is_available ?? true }
                      : c
                  )
                );
              }
            )
            .on(
              "postgres_changes",
              { event: "DELETE", schema: "public", table: "containers" },
              (payload: any) => {
                setContainers((prev) => prev.filter((c) => c.id !== String(payload.old.id)));
              }
            );

          await channel.subscribe();
          channelOrSub = channel;
        } else {
          // fallback v1 subscriptions
          const subInsert = (supabase as any)
            .from("containers")
            .on("INSERT", (payload: any) => {
              const newRow = { ...payload.new, id: String(payload.new.id), available: payload.new.is_available ?? true };
              setContainers((prev) => [newRow, ...prev]);
            })
            .subscribe();

          const subUpdate = (supabase as any)
            .from("containers")
            .on("UPDATE", (payload: any) => {
              setContainers((prev) =>
                prev.map((c) =>
                  c.id === String(payload.new.id)
                    ? { ...payload.new, id: String(payload.new.id), available: payload.new.is_available ?? true }
                    : c
                )
              );
            })
            .subscribe();

          const subDelete = (supabase as any)
            .from("containers")
            .on("DELETE", (payload: any) => {
              setContainers((prev) => prev.filter((c) => c.id !== String(payload.old.id)));
            })
            .subscribe();

          channelOrSub = { subInsert, subUpdate, subDelete };
        }
      } catch (err) {
        console.warn("Realtime subscription setup failed:", err);
      }
    };

    fetchContainers();
    setupRealtime();

    return () => {
      mounted = false;
      (async () => {
        if (!channelOrSub) return;
        try {
          if (typeof channelOrSub.unsubscribe === "function") await channelOrSub.unsubscribe();
          else if (typeof (supabase as any).removeChannel === "function") await (supabase as any).removeChannel(channelOrSub);
          else {
            if (channelOrSub.subInsert) (supabase as any).removeSubscription(channelOrSub.subInsert);
            if (channelOrSub.subUpdate) (supabase as any).removeSubscription(channelOrSub.subUpdate);
            if (channelOrSub.subDelete) (supabase as any).removeSubscription(channelOrSub.subDelete);
          }
        } catch {}
      })();
    };
  }, []);

  const handleBookContainer = (container: Container) => {
    if (onBookContainer) {
      onBookContainer(container);
    } else {
      // Fallback: navigate to booking page
      router.push(`/booking/${container.id}`);
    }
  };

  if (loading) return <p className="text-center py-6">Loading containers...</p>;
  if (containers.length === 0) return <p className="text-center py-6">No containers available at the moment.</p>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 md:px-8 py-8">
      {containers.map((container) => (
        <div
          key={container.id}
          className="
            flex flex-col md:flex-row 
            bg-gradient-to-tr from-gray-900/90 via-gray-800/80 to-gray-900/90 
            rounded-2xl shadow-lg 
            overflow-hidden 
            hover:shadow-xl transition-shadow duration-300 
            w-full md:w-[900px] mx-auto
          "
        >
          {/* Image - larger and fixed */}
          <div className="md:w-96 w-full h-64 md:h-auto flex-shrink-0 bg-gray-700/20 relative overflow-hidden">
            {container.image_url ? (
              <img
                src={container.image_url}
                alt={container.title ?? "Container image"}
                className="w-full h-full object-cover cursor-pointer"
                loading="lazy"
                draggable={false}
                onClick={() => onContainerSelect?.(container)}
              />
            ) : (
              <div 
                className="flex items-center justify-center h-full text-gray-400 text-lg font-semibold cursor-pointer"
                onClick={() => onContainerSelect?.(container)}
              >
                No Image
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 
                className="text-2xl font-bold text-white truncate cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => onContainerSelect?.(container)}
              >
                {container.title ?? "Untitled"}
              </h3>
              <p className="mt-2 text-gray-300 text-base line-clamp-3 min-h-[3.6em]">{container.description ?? "No description provided."}</p>

              {/* Info grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-gray-300 text-sm">
                <div>
                  <span className="block uppercase font-semibold tracking-wide text-xs text-gray-500">Size</span>
                  <span className="font-medium text-white">{container.size ?? "—"}</span>
                </div>

                <div>
                  <span className="block uppercase font-semibold tracking-wide text-xs text-gray-500">Price</span>
                  <span className="font-medium text-white">{container.price != null ? `$${container.price.toFixed(2)}` : "—"}</span>
                </div>

                <div>
                  <span className="block uppercase font-semibold tracking-wide text-xs text-gray-500">Availability</span>
                  <span
                    className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${container.available ? "bg-green-700 text-green-200" : "bg-red-700 text-red-200"}`}
                  >
                    {container.available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div>
                  <span className="block uppercase font-semibold tracking-wide text-xs text-gray-500">Available Date</span>
                  <span className="font-medium text-white">{container.available_date ?? "—"}</span>
                </div>

                <div className="col-span-full sm:col-span-1">
                  <span className="block uppercase font-semibold tracking-wide text-xs text-gray-500">Location</span>
                  <span className="font-medium text-white truncate block max-w-full">{container.location ?? container.address ?? "—"}</span>
                </div>

                <div className="col-span-full sm:col-span-1">
                  <span className="block uppercase font-semibold tracking-wide text-xs text-gray-500">Created At</span>
                  <span className="font-medium text-gray-400">{container.created_at ? new Date(container.created_at).toLocaleString() : "—"}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onContainerSelect?.(container)}
                className="
                  w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-lg 
                  bg-gray-600 hover:bg-gray-700 text-white
                  transition-colors duration-300
                "
                aria-label={`View details for container ${container.title ?? "Untitled"}`}
              >
                View Details
              </button>
              
              <button
                onClick={() => handleBookContainer(container)}
                disabled={!container.available}
                className={`
                  w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-lg 
                  transition-colors duration-300 
                  ${container.available 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-gray-600 cursor-not-allowed text-gray-400"}
                `}
                aria-label={`Book container ${container.title ?? "Untitled"}`}
              >
                {container.available ? "Book with Add-ons" : "Unavailable"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}