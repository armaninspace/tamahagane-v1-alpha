args <- commandArgs(trailingOnly = TRUE)
#args <- '{"csv_path":"D:/R/voronoilatlong.csv", "img_path":"D:/R/wcloud_54_28_1.png","chart_title":"WC title 1","geomap_lat":"lat","geomap_long":"long","filters":[]}'
suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(RJSONIO))
suppressPackageStartupMessages(library(ggplot2))
suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(ggmap))

GetDataFrame <- function(csvPath, filesType = "csv") {
  
 # df <- fread(input = csvPath,
  #            header = T,
  #            sep = ',',
  #            na.strings = c("", "NA"),
  #            stringsAsFactors = TRUE,
  #            encoding = "Latin-1")
  df <- read.csv(file = csvPath,
                header = TRUE,
                na.string = c("", "NA"),
                stringsAsFactors = TRUE,
                encoding = "Latin-1"
  )
  df <- as.data.frame(df)
  df
}

gcd.slc <- function(long1, lat1, long2, lat2) {
    R <- 6371 # Earth mean radius [km]
    miles <- 0.621371 # 1 km equal to this value
    d <- acos(sin(lat1)*sin(lat2) + cos(lat1)*cos(lat2) * cos(long2-long1)) * R
    dm <- d * miles
    return(dm) # Distance in Miles
}

json <- rawToChar(base64decode(args))
chartOptions <- fromJSON(json)

csvPath     <- chartOptions$csv_path
imgPath     <- chartOptions$img_path
xCol        <- chartOptions$geomap_lat
yCol        <- chartOptions$geomap_long
chartTitle  <- chartOptions$chart_title
geomap_city <- chartOptions$geomap_city
geomap_miles <- chartOptions$geomap_miles

# get data frame
df <- GetDataFrame(csvPath) # csvPath

if(geomap_city != ""){
    city_latlon <- geocode(geomap_city)
}else{
    city_latlon <- ""
}

if(length(chartOptions$filters) > 0) {
 
  # generate a string of all filters
  filterStr <- ""
  filterContainsList <- list()
  for (i in seq_along(chartOptions$filters)) {
    
    colname <- chartOptions$filters[[i]][["colname"]]
    operator <- chartOptions$filters[[i]][["operator"]]
    required_val <- chartOptions$filters[[i]][["required_val"]]
    
    if (operator == "contains") {
      
      filterContainsList <- append(filterContainsList, 
                                   list(list(colname, required_val)))
    } else {
      
      required_val_modify <- ifelse(operator == "==", 
                                    paste0(" '", required_val, "'"), 
                                    paste0(" ", required_val))
      
      filterStr <- paste0(filterStr, colname, " ", operator, 
                          required_val_modify, " & ")
      
    }
  }
  filterStr <- substr(filterStr, 1, nchar(filterStr)-3)
  
  
  # apply contains filters
  if (length(filterContainsList) > 0) {
    
    for (j in seq_along(filterContainsList)) {
      filterCol <- filterContainsList[[j]][[1]]
      filterVal <- filterContainsList[[j]][[2]]
      
      retriveTrues <- grepl(pattern = filterVal, x = df[, filterCol], 
                            ignore.case = TRUE)
      df <- df[retriveTrues, ]
    }
  }
  
  # apply numeric filters
  if (nchar(filterStr) > 0) {
    
    dfFiltered <- df %>%
      filter_(filterStr)  %>%
      select(xCol, yCol)
  } else {
    dfFiltered <- df %>%
      select(xCol, yCol)
  }
  
  
  if (nrow(dfFiltered) > 0) {
    
    dfFiltered[is.na(dfFiltered)] <- ""
    
    jsonString <- ""
    for (datarow in 1:nrow(dfFiltered)){
      
      if(dfFiltered[datarow, xCol] == ""){
        next()
      }
      if(city_latlon != ""){
        lon2 <- dfFiltered[datarow, yCol]
        lat2 <- dfFiltered[datarow, xCol]
        dist <- gcd.slc(as.numeric(city_latlon["lon"]), as.numeric(city_latlon["lat"]), as.numeric(lon2), as.numeric(lat2))
        if(as.numeric(dist) > as.numeric(geomap_miles)){
            next()
        }
      }
      jsonString <- paste0(jsonString,"[",dfFiltered[datarow, xCol],",",dfFiltered[datarow, yCol],"],")
      
    }
    
    jsonString <- substr(jsonString, 1, nchar(jsonString)-1)
    print(jsonString)
  }
  # print(paste("Total rows returns against filter(s) are:", nrow(dfFiltered)))
  #   print("Chart generated")
  # } else {
  #   print("Chart not generated")
  # }
  
} else {
  
  dfFiltered <- df %>%
    select(xCol, yCol)
  
  dfFiltered[is.na(dfFiltered)] <- ""
  
  jsonString <- ""
  for (datarow in 1:nrow(dfFiltered)){
    
    if(dfFiltered[datarow, xCol] == ""){
      next()
    }
    if(city_latlon != ""){
      lon2 <- dfFiltered[datarow, yCol]
      lat2 <- dfFiltered[datarow, xCol]
      dist <- gcd.slc(as.numeric(city_latlon["lon"]), as.numeric(city_latlon["lat"]), as.numeric(lon2), as.numeric(lat2))
      if(as.numeric(dist) > as.numeric(geomap_miles)){
          next()
      }
    }
    jsonString <- paste0(jsonString,"[",dfFiltered[datarow, xCol],",",dfFiltered[datarow, yCol],"],")
    
  }
  
  jsonString <- substr(jsonString, 1, nchar(jsonString)-1)
  print(jsonString)
  
  # print(paste("Total rows returns against filter(s) are:", nrow(dfFiltered)))
  #   print("Chart generated")
  # } else {
  #   print("Chart not generated")
  # }
}

