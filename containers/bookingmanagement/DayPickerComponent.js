import Head from "next/head";
import React, { useState } from "react";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { formatDate, parseDate } from "react-day-picker/moment";
import { Controller, useFieldArray, useForm } from "react-hook-form";

function DayPicker({ index, control, availableDates }) {
  const [from, setFrom] = useState(undefined);
  const [to, setTo] = useState(undefined);

  function showFromMonth() {
    if (!from) {
      return;
    }
  }

  function handleFromChange(from) {
    // Change the from date and focus the "to" input field
    setFrom(from);
  }

  function handleToChange(to) {
    setTo(to);
    showFromMonth();
  }

  const modifiers = { start: from, end: to };

  const customCss = `.DayPickerInput input {
      color: rgba(71, 85, 105, 1);
      font-size: 0.875rem;
      line-height: 1.25rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      background-color: rgba(255, 255, 255,1);
      border-width: 0px;
      border-radius: 0.25rem;
      position: relative;
      border-color: #71717a;
      appearance: none;
     width: 145px;
    }`;

  return (
    <>
      <Head>
        <style>{customCss}</style>
      </Head>
      <div className="flex items-center">
        {/* use the className */}
        <div className="">
          <Controller
            control={control}
            name={`availableDates[${index}].from`}
            rules={{ validate: (value) => (availableDates ? Boolean(value) : true) || "From date must be entered" }}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, isTouched, isDirty, error } }) => {
              return (
                <>
                  <DayPickerInput
                    ref={ref}
                    value={value}
                    placeholder="From"
                    format="LL"
                    formatDate={formatDate}
                    parseDate={parseDate}
                    dayPickerProps={{
                      selectedDays: [from, { from, to }],
                      disabledDays: { after: to },
                      // disabledDays: { before: new Date(), after: to },
                      toMonth: to,
                      modifiers,
                      numberOfMonths: 1,
                      // onDayClick: () => ref.current?.getInput().focus(),
                    }}
                    onDayChange={(from) => {
                      handleFromChange(from);
                      onChange(from);
                    }}
                  />
                  <p className="text-xs text-red-500">{error?.message}</p>
                </>
              );
            }}
          />
        </div>
        <div className="mx-1 font-bold">to</div>
        <div className="">
          <Controller
            control={control}
            name={`availableDates[${index}].to`}
            rules={{ validate: (value) => (availableDates ? Boolean(value) : true) || "To date must be entered" }}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { invalid, isTouched, isDirty, error } }) => {
              return (
                <>
                  <DayPickerInput
                    ref={ref}
                    value={value}
                    placeholder="To"
                    format="LL"
                    formatDate={formatDate}
                    parseDate={parseDate}
                    dayPickerProps={{
                      selectedDays: [from, { from, to }],
                      disabledDays: { before: from },
                      modifiers,
                      month: from,
                      fromMonth: from,
                      numberOfMonths: 1,
                    }}
                    onDayChange={(to) => {
                      handleToChange(to);
                      onChange(to);
                    }}
                  />
                  <p className="text-xs text-red-500">{error?.message}</p>
                </>
              );
            }}
          />
        </div>
      </div>
    </>
  );
}

const DayPickerComponent = ({ index, control, availableDates }) => {
  return (
    <div>
      <DayPicker index={index} control={control} availableDates={availableDates} />
    </div>
  );
};

export default DayPickerComponent;
