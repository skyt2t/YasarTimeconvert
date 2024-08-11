import React, {useState, useEffect} from 'react'
import './App.css'

const availableTimeZones = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/Los_Angeles',
  'Europe/Berlin',
  'America/Chicago',
  'Asia/Shanghai',
  'Europe/Paris',
  'Africa/Lagos',
  'Asia/Singapore',
  'America/Sao_Paulo',
  'Asia/Dubai',
  // Add more as needed
]

const offsets = {
  UTC: 0,
  'Asia/Kolkata': 330,
  'America/New_York': -300,
  'Europe/London': 0,
  'Asia/Tokyo': 540,
  'Australia/Sydney': 600,
  'America/Los_Angeles': -480,
  'Europe/Berlin': 60,
  'America/Chicago': -360,
  'Asia/Shanghai': 480,
  'Europe/Paris': 60,
  'Africa/Lagos': 60,
  'Asia/Singapore': 480,
  'America/Sao_Paulo': -180,
  'Asia/Dubai': 240,
  // Add more offsets as needed
}

const formatTimeForGoogleCalendar = (hours, minutes, period) => {
  let totalMinutes

  if (period === 'PM') {
    if (hours !== 12) {
      totalMinutes = (hours + 12) * 60 + minutes
    } else {
      totalMinutes = 12 * 60 + minutes // 12 PM is 12:00
    }
  } else if (period === 'AM') {
    if (hours === 12) {
      totalMinutes = 0 * 60 + minutes // 12 AM is 00:00
    } else {
      totalMinutes = hours * 60 + minutes
    }
  } else {
    totalMinutes = hours * 60 + minutes
  }

  const startTime = new Date()
  startTime.setUTCMinutes(totalMinutes)

  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // Assuming 1-hour duration
  const formatDate = date => date.toISOString().replace(/-|:|\.\d+Z/g, '')

  return {
    startTime: formatDate(startTime),
    endTime: formatDate(endTime),
  }
}

const App = () => {
  const [timeZones, setTimeZones] = useState([
    {name: 'UTC', hours: 8, minutes: 0, period: 'AM'},
    {name: 'Asia/Kolkata', hours: 2, minutes: 0, period: 'PM'},
  ])
  const [darkMode, setDarkMode] = useState(false)
  const [selectedTimeZone, setSelectedTimeZone] = useState('')

  const timeToMinutes = (hours, minutes, period) => {
    let totalHours

    if (period === 'PM') {
      if (hours !== 12) {
        totalHours = hours + 12
      } else {
        totalHours = 12 // 12 PM is 12:00
      }
    } else if (period === 'AM') {
      if (hours === 12) {
        totalHours = 0 // 12 AM is 00:00
      } else {
        totalHours = hours
      }
    } else {
      totalHours = hours
    }

    return totalHours * 60 + minutes
  }

  const minutesToTime = minutes => {
    const totalMinutes = ((minutes % 1440) + 1440) % 1440 // Ensure positive value
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    const period = hours < 12 ? 'AM' : 'PM'
    const displayHours = hours % 12 || 12
    return {hours: displayHours, minutes: mins, period}
  }

  const updateTimeZones = (index, newHours, newMinutes, newPeriod) => {
    const baseTime = timeToMinutes(newHours, newMinutes, newPeriod)
    const updatedZones = timeZones.map((zone, i) => {
      if (i === index) {
        return {
          ...zone,
          hours: newHours,
          minutes: newMinutes,
          period: newPeriod,
        }
      } else {
        const offset = offsets[zone.name] - offsets[timeZones[index].name]
        const newTime = baseTime + offset
        const updatedTime = minutesToTime(newTime)
        return {
          ...zone,
          hours: updatedTime.hours,
          minutes: updatedTime.minutes,
          period: updatedTime.period,
        }
      }
    })
    setTimeZones(updatedZones)
  }

  const handleTimeInputChange = (index, field, value) => {
    const updatedZones = [...timeZones]
    updatedZones[index] = {
      ...updatedZones[index],
      [field]: value,
    }
    setTimeZones(updatedZones)
    updateTimeZones(
      index,
      updatedZones[index].hours,
      updatedZones[index].minutes,
      updatedZones[index].period,
    )
  }

  const handleSliderChange = (index, event) => {
    const newTime = parseInt(event.target.value, 10)
    const {hours, minutes, period} = minutesToTime(newTime)
    updateTimeZones(index, hours, minutes, period)
  }

  const handleAddTimeZone = () => {
    if (
      selectedTimeZone &&
      !timeZones.find(tz => tz.name === selectedTimeZone)
    ) {
      const defaultTime = {hours: 8, minutes: 0, period: 'AM'}
      const newZone = {name: selectedTimeZone, ...defaultTime}
      setTimeZones([...timeZones, newZone])
      setSelectedTimeZone('')
    }
  }

  const handleDeleteTimeZone = name => {
    setTimeZones(timeZones.filter(zone => zone.name !== name))
  }

  const handleSwapZones = () => {
    setTimeZones(timeZones.slice().reverse())
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const generateGoogleCalendarUrl = () => {
    const {startTime, endTime} = formatTimeForGoogleCalendar(
      timeZones[0].hours,
      timeZones[0].minutes,
      timeZones[0].period,
    )
    const eventTitle = 'Meeting'
    const eventDescription = 'Scheduled meeting with time zones'
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventTitle,
    )}&dates=${startTime}/${endTime}&details=${encodeURIComponent(
      eventDescription,
    )}`
  }

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--slider-color-start',
      darkMode ? '#555' : '#007bff',
    )
    document.documentElement.style.setProperty(
      '--slider-color-end',
      darkMode ? '#333' : '#ccc',
    )
    document.documentElement.style.setProperty(
      '--thumb-color',
      darkMode ? '#bbb' : '#007bff',
    )
  }, [darkMode])

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <div className="converter">
        <h1>Time Zone Converter</h1>
        <div className="controls">
          <button className="button" onClick={toggleDarkMode}>
            Toggle Dark Mode
          </button>
          <button className="button" onClick={handleSwapZones}>
            Swap Time Zones
          </button>
          <div className="add-time-zone-container">
            <select
              value={selectedTimeZone}
              onChange={e => setSelectedTimeZone(e.target.value)}
              className={`time-input ${darkMode ? 'dark-mode' : ''}`}
            >
              <option value="">Select Time Zone</option>
              {availableTimeZones.map(zone => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <button
              className="button"
              onClick={handleAddTimeZone}
              disabled={!selectedTimeZone}
            >
              SELECT
            </button>
          </div>
          <a
            href={generateGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="button schedule-meet-button"
          >
            Schedule Meet
          </a>
        </div>

        <div className="time-zone-list">
          {timeZones.map((zone, index) => (
            <div key={zone.name} className="time-zone-item">
              <div className="time-column">
                <h2>{zone.name}</h2>
                <input
                  type="range"
                  min="0"
                  max="1439"
                  value={timeToMinutes(zone.hours, zone.minutes, zone.period)}
                  onChange={event => handleSliderChange(index, event)}
                  className="slider"
                />
                <div className="time-input-container">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={zone.hours}
                    onChange={event =>
                      handleTimeInputChange(
                        index,
                        'hours',
                        parseInt(event.target.value, 10),
                      )
                    }
                    className={`time-input ${darkMode ? 'dark-mode' : ''}`}
                    placeholder="Hours"
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={zone.minutes}
                    onChange={event =>
                      handleTimeInputChange(
                        index,
                        'minutes',
                        parseInt(event.target.value, 10),
                      )
                    }
                    className={`time-input ${darkMode ? 'dark-mode' : ''}`}
                    placeholder="Minutes"
                  />
                  <select
                    value={zone.period}
                    onChange={event =>
                      handleTimeInputChange(index, 'period', event.target.value)
                    }
                    className={`time-input ${darkMode ? 'dark-mode' : ''}`}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                  <div className={`edit-note ${darkMode ? 'dark-mode' : ''}`}>
                    (Change time by editing fields above)
                  </div>
                </div>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDeleteTimeZone(zone.name)}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      </div>
      <footer className={`footer ${darkMode ? 'dark-mode' : ''}`}>
        <h2>About UTC</h2>
        <div className="utc-info">
          <div className="utc-info-item">
            <h3>Coordinated Universal Time (UTC)</h3>
            <p>
              UTC is the world time standard that regulates clocks and time. It
              is the successor to Greenwich Mean Time (GMT). For casual use, UTC
              is the same as GMT, but it is used by the scientific community.
            </p>
            <ul>
              <li>
                W3C/ISO-8601: International standard covering representation and
                exchange of dates and time-related data
              </li>
              <li>Email/RFC-2822: Internet Message Format Date Standard</li>
              <li>
                Military/NATO: Used by the U.S. military, Chinese military, and
                others
              </li>
              <li>
                IANA/Olson: Reflects UTC time zone boundaries defined by
                political bodies
              </li>
            </ul>
          </div>
          <div className="utc-info-item">
            <h3>Time Zones with GMT ±00:00 Offset</h3>
            <ul>
              <li>GMT - Greenwich Mean Time</li>
              <li>UTC - Universal Time Coordinated</li>
              <li>WET - Western European Time</li>
              <li>EGST - Eastern Greenland Summer Time</li>
              <li>AZOST - Azores Summer Time</li>
              <li>WT - Western Sahara Time</li>
              <li>Z - Zulu Time Zone</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
