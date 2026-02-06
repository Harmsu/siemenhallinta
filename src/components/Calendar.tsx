import { useState, useMemo } from 'react';
import type { Planting, CareLogEntry, Seed, PlantingLocation } from '../types';
import { CARE_TYPE_LABELS, MONTH_NAMES } from '../types';
import './Calendar.css';

// Paikallinen päivämäärämuotoilu (välttää UTC-muunnoksen)
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface CalendarProps {
  plantings: Planting[];
  careLogs: CareLogEntry[];
  seeds: Seed[];
  locations: PlantingLocation[];
  onAddCareLog: (plantingId: string, date: string) => void;
  onAddPlanting: (date: string) => void;
}

interface DayEvents {
  plantings: Array<{ planting: Planting; seed?: Seed; location?: PlantingLocation }>;
  careLogs: Array<{ log: CareLogEntry; planting?: Planting; seed?: Seed }>;
}

export function Calendar({
  plantings,
  careLogs,
  seeds,
  locations,
  onAddCareLog,
  onAddPlanting,
}: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getSeed = (seedId: string) => seeds.find((s) => s.id === seedId);
  const getLocation = (locationId: string) => locations.find((l) => l.id === locationId);
  const getPlanting = (plantingId: string) => plantings.find((p) => p.id === plantingId);

  // Luo päivien tapahtumat
  const eventsByDate = useMemo(() => {
    const events: Record<string, DayEvents> = {};

    // Istutukset
    plantings.forEach((planting) => {
      const date = planting.plantedDate.split('T')[0];
      if (!events[date]) {
        events[date] = { plantings: [], careLogs: [] };
      }
      events[date].plantings.push({
        planting,
        seed: getSeed(planting.seedId),
        location: getLocation(planting.locationId),
      });
    });

    // Hoitomerkinnät
    careLogs.forEach((log) => {
      const date = log.date.split('T')[0];
      if (!events[date]) {
        events[date] = { plantings: [], careLogs: [] };
      }
      const planting = getPlanting(log.plantingId);
      events[date].careLogs.push({
        log,
        planting,
        seed: planting ? getSeed(planting.seedId) : undefined,
      });
    });

    return events;
  }, [plantings, careLogs, seeds, locations]);

  // Kuukauden päivät
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Maanantai = 0
    const daysInMonth = lastDay.getDate();

    const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];

    // Edellisen kuukauden päivät
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      days.push({
        date: formatDateLocal(date),
        day,
        isCurrentMonth: false,
      });
    }

    // Tämän kuukauden päivät
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({
        date: formatDateLocal(date),
        day,
        isCurrentMonth: true,
      });
    }

    // Seuraavan kuukauden päivät (täytä 6 riviä)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date: formatDateLocal(date),
        day,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const todayStr = formatDateLocal(today);
  const selectedEvents = selectedDate ? eventsByDate[selectedDate] : null;

  // Aktiiviset istutukset (hoitomerkinnän lisäämistä varten)
  const activePlantings = plantings.filter((p) => p.status === 'active');

  return (
    <div className="calendar-container">
      <div className="calendar">
        <div className="calendar-header">
          <button className="btn-nav" onClick={goToPrevMonth}>
            ‹
          </button>
          <div className="calendar-title">
            <h2>{MONTH_NAMES[currentMonth]} {currentYear}</h2>
            <button className="btn-today" onClick={goToToday}>
              Tänään
            </button>
          </div>
          <button className="btn-nav" onClick={goToNextMonth}>
            ›
          </button>
        </div>

        <div className="calendar-weekdays">
          {['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map(({ date, day, isCurrentMonth }) => {
            const events = eventsByDate[date];
            const isToday = date === todayStr;
            const isSelected = date === selectedDate;
            const hasPlantings = events?.plantings.length > 0;
            const hasCareLogs = events?.careLogs.length > 0;

            return (
              <div
                key={date}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="day-number">{day}</span>
                {(hasPlantings || hasCareLogs) && (
                  <div className="day-indicators">
                    {hasPlantings && <span className="indicator planting-indicator" title="Istutus" />}
                    {hasCareLogs && <span className="indicator carelog-indicator" title="Hoitomerkintä" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-sidebar">
        {selectedDate ? (
          <>
            <h3>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fi-FI', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>

            <div className="sidebar-actions">
              <button className="btn-action" onClick={() => onAddPlanting(selectedDate)}>
                + Uusi istutus
              </button>
              {activePlantings.length > 0 && (
                <select
                  className="select-planting"
                  onChange={(e) => {
                    if (e.target.value) {
                      onAddCareLog(e.target.value, selectedDate);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    + Hoitomerkintä istutukselle...
                  </option>
                  {activePlantings.map((p) => {
                    const seed = getSeed(p.seedId);
                    return (
                      <option key={p.id} value={p.id}>
                        {seed?.nameFi} {seed?.variety ? `(${seed.variety})` : ''}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {selectedEvents ? (
              <div className="day-events">
                {selectedEvents.plantings.length > 0 && (
                  <div className="events-section">
                    <h4>🌱 Istutukset</h4>
                    {selectedEvents.plantings.map(({ planting, seed, location }) => (
                      <div key={planting.id} className="event-item planting-event">
                        <strong>{seed?.nameFi || 'Tuntematon'}</strong>
                        {seed?.variety && <span className="variety"> ({seed.variety})</span>}
                        <div className="event-details">
                          📍 {location?.name || 'Tuntematon paikka'}
                          {planting.quantity > 0 && ` • ${planting.quantity} kpl`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedEvents.careLogs.length > 0 && (
                  <div className="events-section">
                    <h4>📋 Hoitomerkinnät</h4>
                    {selectedEvents.careLogs.map(({ log, seed }) => (
                      <div key={log.id} className="event-item carelog-event">
                        <strong>{CARE_TYPE_LABELS[log.type]}</strong>
                        <span className="event-seed">
                          {seed?.nameFi || 'Tuntematon'}
                          {seed?.variety && ` (${seed.variety})`}
                        </span>
                        {log.notes && <div className="event-notes">{log.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="no-events">Ei merkintöjä tälle päivälle</p>
            )}
          </>
        ) : (
          <p className="select-date-hint">Valitse päivä kalenterista nähdäksesi tai lisätäksesi merkintöjä</p>
        )}
      </div>
    </div>
  );
}
