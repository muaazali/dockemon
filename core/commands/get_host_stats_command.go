package docker_commands

import (
	"dockemon/core/commandbuilder"
	"dockemon/core/hosts"
	"dockemon/core/models"
	"fmt"
	"runtime"
)

// windowsHostStatsCommand reports live CPU, memory, swap and storage usage via WMI/CIM as JSON.
const windowsHostStatsCommand = `$c=(Get-CimInstance Win32_Processor); $cores=($c|Measure-Object NumberOfLogicalProcessors -Sum).Sum; $cpu=($c|Measure-Object LoadPercentage -Average).Average; $os=Get-CimInstance Win32_OperatingSystem; $mt=[math]::Round($os.TotalVisibleMemorySize/1KB,0); $mf=[math]::Round($os.FreePhysicalMemory/1KB,0); $mu=$mt-$mf; $vt=[math]::Round($os.TotalVirtualMemorySize/1KB,0); $vf=[math]::Round($os.FreeVirtualMemory/1KB,0); $st=$vt-$mt; $sf=$vf-$mf; $su=$st-$sf; $d=Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3'; $dt=[math]::Round(($d|Measure-Object Size -Sum).Sum/1MB,0); $df=[math]::Round(($d|Measure-Object FreeSpace -Sum).Sum/1MB,0); $du=$dt-$df; [ordered]@{timestamp=(Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ');cpu=[ordered]@{usage_percent=$cpu;core_count=$cores};memory=[ordered]@{total_mb=$mt;used_mb=$mu;free_mb=$mf;used_percent=[math]::Round(($mu/$mt)*100,1)};swap=[ordered]@{total_mb=$st;used_mb=$su;free_mb=$sf};storage=[ordered]@{total_mb=$dt;used_mb=$du;free_mb=$df}} | ConvertTo-Json -Depth 4`

// unixHostStatsCommand reports live CPU, memory, swap and storage usage on Linux/macOS as JSON.
const unixHostStatsCommand = `bash -c 'cpu_idle=$(top -bn1 | grep "Cpu(s)" | grep -oP "[\d.]+(?=\s*id)"); cpu_used=$(awk "BEGIN {printf \"%.1f\", 100 - $cpu_idle}"); read mem_total mem_used mem_free mem_shared mem_buffcache mem_available < <(free -m | awk "/^Mem:/ {print \$2, \$3, \$4, \$5, \$6, \$7}"); read swap_total swap_used swap_free < <(free -m | awk "/^Swap:/ {print \$2, \$3, \$4}"); read disk_total disk_used disk_avail disk_pct < <(df -BM --total | awk "/^total/ {gsub(\"M\",\"\",\$2); gsub(\"M\",\"\",\$3); gsub(\"M\",\"\",\$4); gsub(\"%\",\"\",\$5); print \$2, \$3, \$4, \$5}"); read load1 load5 load15 <<< "$(uptime | grep -oP "load average:\s*\K[\d.]+, [\d.]+, [\d.]+" | tr -d ",")"; cores=$(nproc); printf "{\"timestamp\":\"%s\",\"cpu\":{\"usage_percent\":%s,\"idle_percent\":%s,\"core_count\":%s,\"load_avg\":{\"1min\":%s,\"5min\":%s,\"15min\":%s}},\"memory\":{\"total_mb\":%s,\"used_mb\":%s,\"free_mb\":%s,\"available_mb\":%s,\"used_percent\":%s},\"swap\":{\"total_mb\":%s,\"used_mb\":%s,\"free_mb\":%s},\"storage\":{\"total_mb\":%s,\"used_mb\":%s,\"available_mb\":%s,\"used_percent\":%s}}\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$cpu_used" "$cpu_idle" "$cores" "$load1" "$load5" "$load15" "$mem_total" "$mem_used" "$mem_free" "$mem_available" "$(awk "BEGIN {printf \"%.1f\", ($mem_used/$mem_total)*100}")" "$swap_total" "$swap_used" "$swap_free" "$disk_total" "$disk_used" "$disk_avail" "$disk_pct"'`

// GetHostStats pings a host for its live CPU, memory, swap and storage usage. Localhost uses the
// probe matching the machine dockemon itself runs on; remote hosts are reached over SSH and are
// assumed to be Linux/macOS, since that's what this app's SSH + private-key host connections target.
func GetHostStats(hostId ...string) (models.HostStats, error) {
	cb := commandbuilder.NewCommandBuilder(hostId...)

	command := unixHostStatsCommand
	if cb.HostID == "" || hosts.IsLocalHost(cb.HostID) {
		if runtime.GOOS == "windows" {
			command = windowsHostStatsCommand
		}
	}

	output, err := cb.Execute(command)
	if err != nil {
		return models.HostStats{}, fmt.Errorf("unable to fetch host stats for %q: %w", cb.HostID, err)
	}

	stats, err := models.ParseHostStats(output)
	if err != nil {
		return models.HostStats{}, fmt.Errorf("unable to parse host stats for %q: %w", cb.HostID, err)
	}

	return stats, nil
}
