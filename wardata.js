const fs = require('fs');
const createLogger = require('logging');
const moment = require('moment');

class WarData {
  constructor() {
    this.announcedWar = false;
    this.warDate = moment.utc();
    this.logger = createLogger.default('WarData');
    this.fileName = 'war.data';
  }

  loadWarData() {
    if(fs.existsSync(this.fileName)){
      const warData = JSON.parse(fs.readFileSync(this.fileName, 'utf8'));
      this.warDate = moment.utc(warData.warDate);
      this.announcedWar = warData.announcedWar;

      return true;
    } else {
      this.logger.info(`The file '${this.fileName}' was not found`);

      return false;
    }
  }

  saveWarData() {
    const warData = {
      'warDate': this.warDate.format(),
      'announcedWar': this.announcedWar
    };
    
    var self = this;

    fs.writeFile(this.fileName, JSON.stringify(warData), function(err) {
      if(err){
        self.logger.error(err);
      }
      self.logger.info('War data saved');
    });
  }

  setWarDate(warDate){
    this.warDate = warDate;
  }

  setIsAnnounced(isAnnounced){
    this.announcedWar = isAnnounced;
  }

  warIsAnnounced(){
    return this.announcedWar;
  }

  getWarDate() {
    return this.warDate;
  }
}

module.exports = new WarData();