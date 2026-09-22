export namespace models {
	
	export class DockerContainerData {
	    ID: string;
	    RepoTag: string;
	    RepoTitle: string;
	    Comment: string;
	    // Go type: time
	    Created: any;
	    Size: number;
	    ComposeProjectTitle: string;
	    ImageType: string;
	    IsRunning: boolean;
	    CPUPercentage: string;
	    MemoryUsage: string;
	    MemoryPercentage: string;
	    NetworkIO: string;
	    BlockIO: string;
	    PIDs: string;
	
	    static createFrom(source: any = {}) {
	        return new DockerContainerData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.RepoTag = source["RepoTag"];
	        this.RepoTitle = source["RepoTitle"];
	        this.Comment = source["Comment"];
	        this.Created = this.convertValues(source["Created"], null);
	        this.Size = source["Size"];
	        this.ComposeProjectTitle = source["ComposeProjectTitle"];
	        this.ImageType = source["ImageType"];
	        this.IsRunning = source["IsRunning"];
	        this.CPUPercentage = source["CPUPercentage"];
	        this.MemoryUsage = source["MemoryUsage"];
	        this.MemoryPercentage = source["MemoryPercentage"];
	        this.NetworkIO = source["NetworkIO"];
	        this.BlockIO = source["BlockIO"];
	        this.PIDs = source["PIDs"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DockerImage {
	    Image: string;
	    ID: string;
	    DiskUsage: string;
	    ContentSize: string;
	    Extra: string;
	
	    static createFrom(source: any = {}) {
	        return new DockerImage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Image = source["Image"];
	        this.ID = source["ID"];
	        this.DiskUsage = source["DiskUsage"];
	        this.ContentSize = source["ContentSize"];
	        this.Extra = source["Extra"];
	    }
	}
	export class Host {
	    ID: string;
	    Name: string;
	    Address: string;
	    Port: number;
	    User: string;
	    PrivateKeyPath: string;
	
	    static createFrom(source: any = {}) {
	        return new Host(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	        this.Address = source["Address"];
	        this.Port = source["Port"];
	        this.User = source["User"];
	        this.PrivateKeyPath = source["PrivateKeyPath"];
	    }
	}
	export class HostStats {
	    Timestamp: string;
	    CPUUsagePercent: number;
	    CPUCoreCount: number;
	    CPULoadAvg1Min: number;
	    CPULoadAvg5Min: number;
	    CPULoadAvg15Min: number;
	    MemoryTotalMB: number;
	    MemoryUsedMB: number;
	    MemoryFreeMB: number;
	    MemoryUsedPercent: number;
	    SwapTotalMB: number;
	    SwapUsedMB: number;
	    SwapFreeMB: number;
	    StorageTotalMB: number;
	    StorageUsedMB: number;
	    StorageFreeMB: number;
	    StorageUsedPercent: number;
	
	    static createFrom(source: any = {}) {
	        return new HostStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Timestamp = source["Timestamp"];
	        this.CPUUsagePercent = source["CPUUsagePercent"];
	        this.CPUCoreCount = source["CPUCoreCount"];
	        this.CPULoadAvg1Min = source["CPULoadAvg1Min"];
	        this.CPULoadAvg5Min = source["CPULoadAvg5Min"];
	        this.CPULoadAvg15Min = source["CPULoadAvg15Min"];
	        this.MemoryTotalMB = source["MemoryTotalMB"];
	        this.MemoryUsedMB = source["MemoryUsedMB"];
	        this.MemoryFreeMB = source["MemoryFreeMB"];
	        this.MemoryUsedPercent = source["MemoryUsedPercent"];
	        this.SwapTotalMB = source["SwapTotalMB"];
	        this.SwapUsedMB = source["SwapUsedMB"];
	        this.SwapFreeMB = source["SwapFreeMB"];
	        this.StorageTotalMB = source["StorageTotalMB"];
	        this.StorageUsedMB = source["StorageUsedMB"];
	        this.StorageFreeMB = source["StorageFreeMB"];
	        this.StorageUsedPercent = source["StorageUsedPercent"];
	    }
	}

}

