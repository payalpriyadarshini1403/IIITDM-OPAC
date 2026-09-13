import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { getBookById, type Book } from '../lib/queries';
import { Book as BookIcon, DoorOpen } from 'lucide-react';
import React from 'react';

const GRID_ROWS = 8;
const GRID_COLS = 6;
const ENTRANCE_ROW = 7; // bottom-center
const ENTRANCE_COL = 2;

type CellType = 'empty' | 'shelf' | 'highlighted' | 'entrance' | 'corridor';

function classifyCell(r: number, c: number, targetRow: number, targetCol: number): CellType {
  if (r === ENTRANCE_ROW && c === ENTRANCE_COL) return 'entrance';
  if (r === targetRow && c === targetCol) return 'highlighted';
  if (r === GRID_ROWS - 1) return 'corridor'; // Bottom row = corridor
  if (c === 0) return 'corridor'; // Left column = aisle
  return 'shelf';
}

const CELL_COLORS: Record<CellType, { bg: string; border: string; label?: React.ReactNode }> = {
  highlighted: { bg: '#155E63', border: '#0E4145', label: <BookIcon size={16} color="white" /> },
  entrance:    { bg: '#D99A5B', border: '#B8824A', label: <DoorOpen size={16} color="white" /> },
  corridor:    { bg: '#F7F3E8', border: '#EDE9DD' },
  shelf:       { bg: '#E5E0D8', border: '#D5CFC7' },
  empty:       { bg: 'transparent', border: 'transparent' },
};

export default function LocationMatrix() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: { grid_row: number; grid_col: number; floor: string; section: string } };
  
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    if (id) getBookById(id).then(b => setBook(b || null));
  }, [id]);

  const targetRow = state?.grid_row ?? 2;
  const targetCol = state?.grid_col ?? 3;
  const floor = state?.floor ?? '2nd Floor';
  const section = state?.section ?? 'Unknown Section';

  const entranceRow = ENTRANCE_ROW;
  const entranceCol = ENTRANCE_COL;
  const distance = Math.abs(targetRow - entranceRow) + Math.abs(targetCol - entranceCol);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F3E8' }}>
      <TopBar title="Floor Map" showBack />
      <BottomNav />

      <main style={{ padding: '68px 16px 80px', animation: 'fadeIn 0.35s ease both' }}>
        {/* Header info */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '2px' }}>FLOOR</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#252525' }}>{floor}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '2px' }}>SECTION</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#252525' }}>{section}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '2px' }}>DISTANCE</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#155E63' }}>~{distance * 2}m</div>
          </div>
        </div>

        {/* Grid map */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '16px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', overflow: 'auto',
        }}>
          <div style={{ display: 'grid', gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`, gap: '4px' }}>
            {Array.from({ length: GRID_ROWS }, (_, r) => (
              <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gap: '4px' }}>
                {Array.from({ length: GRID_COLS }, (_, c) => {
                  const type = classifyCell(r, c, targetRow, targetCol);
                  const config = CELL_COLORS[type];
                  return (
                    <div
                      key={c}
                      title={type === 'highlighted' ? `${book?.title ?? 'Your book'}` : type === 'entrance' ? 'Entrance' : undefined}
                      style={{
                        height: '40px',
                        backgroundColor: config.bg,
                        border: `1.5px solid ${config.border}`,
                        borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px',
                        transition: 'transform 0.15s',
                        boxShadow: type === 'highlighted' ? '0 0 0 3px rgba(21,94,99,0.3)' : 'none',
                        animation: type === 'highlighted' ? 'pulse-cell 2s ease infinite' : 'none',
                      }}
                    >
                      {config.label ?? ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
          {[
            { color: '#155E63', label: 'Your book' },
            { color: '#D99A5B', label: 'Entrance' },
            { color: '#E5E0D8', label: 'Shelves' },
            { color: '#F7F3E8', label: 'Corridor' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
              <span style={{ fontSize: '12px', color: '#6B6B6B' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Directions */}
        <div style={{ marginTop: '14px', padding: '14px', backgroundColor: '#ECFDF5', borderRadius: '12px' }}>
          <div style={{ fontSize: '13px', color: '#047857', fontWeight: 500, marginBottom: '4px' }}>
            How to get there
          </div>
          <p style={{ fontSize: '13px', color: '#047857', margin: 0, lineHeight: '1.6' }}>
            Enter from the main entrance (orange marker) → walk to row {targetRow + 1}, column {targetCol + 1} (highlighted in teal) — approximately {distance * 2} metres.
          </p>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-cell{0%,100%{box-shadow:0 0 0 3px rgba(21,94,99,0.3)}50%{box-shadow:0 0 0 6px rgba(21,94,99,0.15)}}
      `}</style>
    </div>
  );
}
