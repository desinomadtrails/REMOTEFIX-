// RemoteFix AI Engine - Repository Scanner
import * as fs from "fs";
import * as path from "path";

export interface ScanResult {
  packages: string[];
  apps: string[];
  routes: string[];
  schemas: string[];
  services: string[];
}

export class RepositoryScanner {
  public static scan(): ScanResult {
    const root = process.cwd();
    const result: ScanResult = {
      packages: [],
      apps: [],
      routes: [],
      schemas: [],
      services: [],
    };

    // Scan packages
    const pkgPath = path.join(root, "packages");
    if (fs.existsSync(pkgPath)) {
      result.packages = fs.readdirSync(pkgPath).filter(f => fs.statSync(path.join(pkgPath, f)).isDirectory());
    }

    // Scan apps
    const appsPath = path.join(root, "apps");
    if (fs.existsSync(appsPath)) {
      result.apps = fs.readdirSync(appsPath).filter(f => fs.statSync(path.join(appsPath, f)).isDirectory());
    }

    // Scan schemas
    const schemaPath = path.join(root, "packages", "database", "database", "schema");
    if (fs.existsSync(schemaPath)) {
      result.schemas = fs.readdirSync(schemaPath).filter(f => f.endsWith(".ts"));
    }

    // Scan routes & services in apps/api
    const apiRoutesPath = path.join(root, "apps", "api", "src", "routes");
    if (fs.existsSync(apiRoutesPath)) {
      result.routes = fs.readdirSync(apiRoutesPath).filter(f => f.endsWith(".ts"));
    }

    const apiServicesPath = path.join(root, "apps", "api", "src", "services");
    if (fs.existsSync(apiServicesPath)) {
      result.services = fs.readdirSync(apiServicesPath).filter(f => f.endsWith(".ts"));
    }

    return result;
  }
}
