package models

import "encoding/json"

// ParseHostStats parses the JSON emitted by the platform-specific host stats probes and
// normalizes it into a HostStats value.
func ParseHostStats(output string) (HostStats, error) {
	var raw hostStatsRaw
	if err := json.Unmarshal([]byte(output), &raw); err != nil {
		return HostStats{}, err
	}
	return raw.toHostStats(), nil
}

type HostStats struct {
	Timestamp          string
	CPUUsagePercent    float64
	CPUCoreCount       int
	CPULoadAvg1Min     float64
	CPULoadAvg5Min     float64
	CPULoadAvg15Min    float64
	MemoryTotalMB      int64
	MemoryUsedMB       int64
	MemoryFreeMB       int64
	MemoryUsedPercent  float64
	SwapTotalMB        int64
	SwapUsedMB         int64
	SwapFreeMB         int64
	StorageTotalMB     int64
	StorageUsedMB      int64
	StorageFreeMB      int64
	StorageUsedPercent float64
}

// hostStatsRaw mirrors the JSON emitted by the platform-specific stats probes. Several fields
// only appear on one platform (e.g. load averages are Unix-only, free_mb vs available_mb differs
// between the PowerShell and bash probes), so those are pointers and normalized in toHostStats.
type hostStatsRaw struct {
	Timestamp string `json:"timestamp"`
	CPU       struct {
		UsagePercent *float64 `json:"usage_percent"`
		IdlePercent  *float64 `json:"idle_percent"`
		CoreCount    int      `json:"core_count"`
		LoadAvg      *struct {
			OneMin     float64 `json:"1min"`
			FiveMin    float64 `json:"5min"`
			FifteenMin float64 `json:"15min"`
		} `json:"load_avg"`
	} `json:"cpu"`
	Memory struct {
		TotalMB     int64    `json:"total_mb"`
		UsedMB      int64    `json:"used_mb"`
		FreeMB      *int64   `json:"free_mb"`
		AvailableMB *int64   `json:"available_mb"`
		UsedPercent *float64 `json:"used_percent"`
	} `json:"memory"`
	Swap struct {
		TotalMB int64 `json:"total_mb"`
		UsedMB  int64 `json:"used_mb"`
		FreeMB  int64 `json:"free_mb"`
	} `json:"swap"`
	Storage struct {
		TotalMB     int64    `json:"total_mb"`
		UsedMB      int64    `json:"used_mb"`
		FreeMB      *int64   `json:"free_mb"`
		AvailableMB *int64   `json:"available_mb"`
		UsedPercent *float64 `json:"used_percent"`
	} `json:"storage"`
}

func percent(used, total int64) float64 {
	if total == 0 {
		return 0
	}
	return float64(used) / float64(total) * 100
}

// toHostStats normalizes the raw, platform-specific probe output into the flat shape the
// frontend consumes, filling in any values the source platform didn't report directly.
func (r hostStatsRaw) toHostStats() HostStats {
	stats := HostStats{
		Timestamp:      r.Timestamp,
		CPUCoreCount:   r.CPU.CoreCount,
		MemoryTotalMB:  r.Memory.TotalMB,
		MemoryUsedMB:   r.Memory.UsedMB,
		SwapTotalMB:    r.Swap.TotalMB,
		SwapUsedMB:     r.Swap.UsedMB,
		SwapFreeMB:     r.Swap.FreeMB,
		StorageTotalMB: r.Storage.TotalMB,
		StorageUsedMB:  r.Storage.UsedMB,
	}

	if r.CPU.UsagePercent != nil {
		stats.CPUUsagePercent = *r.CPU.UsagePercent
	}
	if r.CPU.LoadAvg != nil {
		stats.CPULoadAvg1Min = r.CPU.LoadAvg.OneMin
		stats.CPULoadAvg5Min = r.CPU.LoadAvg.FiveMin
		stats.CPULoadAvg15Min = r.CPU.LoadAvg.FifteenMin
	}

	switch {
	case r.Memory.FreeMB != nil:
		stats.MemoryFreeMB = *r.Memory.FreeMB
	case r.Memory.AvailableMB != nil:
		stats.MemoryFreeMB = *r.Memory.AvailableMB
	default:
		stats.MemoryFreeMB = r.Memory.TotalMB - r.Memory.UsedMB
	}
	if r.Memory.UsedPercent != nil {
		stats.MemoryUsedPercent = *r.Memory.UsedPercent
	} else {
		stats.MemoryUsedPercent = percent(r.Memory.UsedMB, r.Memory.TotalMB)
	}

	switch {
	case r.Storage.FreeMB != nil:
		stats.StorageFreeMB = *r.Storage.FreeMB
	case r.Storage.AvailableMB != nil:
		stats.StorageFreeMB = *r.Storage.AvailableMB
	default:
		stats.StorageFreeMB = r.Storage.TotalMB - r.Storage.UsedMB
	}
	if r.Storage.UsedPercent != nil {
		stats.StorageUsedPercent = *r.Storage.UsedPercent
	} else {
		stats.StorageUsedPercent = percent(r.Storage.UsedMB, r.Storage.TotalMB)
	}

	return stats
}
