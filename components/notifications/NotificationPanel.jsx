import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, TrendingUp, TrendingDown, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const typeConfig = {
  price_spike: { icon: TrendingUp, color: 'text-gain', bg: 'bg-gain/10' },
  price_drop: { icon: TrendingDown, color: 'text-loss', bg: 'bg-loss/10' },
  new_listing: { icon: Tag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
};

function NotifItem({ notif, onRead, onDelete }) {
  const cfg = typeConfig[notif.type] || typeConfig.new_listing;
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl transition-all group",
        !notif.is_read && "bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/8"
      )}
      onClick={() => !notif.is_read && onRead(notif.id)}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
        {notif.sneaker_image
          ? <img src={notif.sneaker_image} alt="" className="w-full h-full object-cover rounded-xl" />
          : <Icon className={`w-4 h-4 ${cfg.color}`} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${notif.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
          {notif.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notif.body}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true, locale: it })}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {!notif.is_read && (
          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notif.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg"
          title="Elimina notifica"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function NotificationPanel({ notifications, unreadCount, onMarkAllRead, onMarkOneRead, onDeleteNotification }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-all">
          <Bell className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_hsl(152,69%,53%,0.6)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="bg-background border-border w-full max-w-sm p-0">
        <SheetHeader className="px-4 pt-5 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Notifiche
              {unreadCount > 0 && (
                <span className="bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} nuove
                </span>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAllRead.mutate()}
                className="text-xs text-muted-foreground h-7 gap-1"
                disabled={onMarkAllRead.isPending}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tutte lette
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Nessuna notifica</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Ti avviseremo quando le tue sneaker si muovono o un seguito pubblica un annuncio.
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {notifications.map(notif => (
                <NotifItem key={notif.id} notif={notif} onRead={onMarkOneRead.mutate} onDelete={onDeleteNotification.mutate} />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}