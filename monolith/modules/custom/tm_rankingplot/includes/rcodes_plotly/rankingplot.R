args <- commandArgs(trailingOnly = TRUE)

suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(RJSONIO))
suppressPackageStartupMessages(library(plotly))
suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(RColorBrewer))

# random number set
set.seed(1776)

# inbound contract check
inboundContractCheck <- list()

GetDataFrame <- function(csvPath, filesType = "csv") {
  
  tryCatch({
    
    #df <- fread(input = csvPath,
         #          header = T,
          #          sep = ',',
           #         na.strings = c("", "NA"),
            #        stringsAsFactors = TRUE,
             #       encoding = "Latin-1")

        #df <- read.csv(csvPath)
        df <- read.csv(file = csvPath,
                header = TRUE,
                na.string = c("", "NA"),
                stringsAsFactors = TRUE,
                encoding = "Latin-1"
                )
    
    df <- as.data.frame(df)
    # keep only complete rows
    complete.rows <- complete.cases(df)
    #df <- df[complete.rows,]
    df
    
  }, warning = function(war) {
    outputWarning = TRUE
    # warning handler picks up where warning was generated
    inboundContractCheck <<- append(inboundContractCheck, list("warning_reading_csv" = war))
  }, error = function(err) {
    outputError = TRUE
    # error handler picks up where error was generated
    inboundContractCheck <<- append(inboundContractCheck, list("error_reading_csv" = err))
  }) # End tryCatch
  
}

# coerce data types
convert.magic <- function(obj, types) {
  
  tryCatch({
    
    for (i in 1:length(obj)){
      FUN <- switch(types[i],character = as.character, 
                    numeric = as.numeric, 
                    factor = as.factor,
                    integer = as.integer,
                    logical = as.logical)
      obj[,i] <- FUN(obj[,i])
    }
    obj
    
  }, warning = function(war) {
    outputWarning = TRUE
    # warning handler picks up where warning was generated
    inboundContractCheck <<- append(inboundContractCheck, list("warning_coerce" = war))
  }, error = function(err) {
    outputError = TRUE
    # error handler picks up where error was generated
    inboundContractCheck <<- append(inboundContractCheck, list("error_coerce" = err))
  }) # End tryCatch
  
}

json <- rawToChar(base64decode(args))
chartOptions <- fromJSON(json)

csvPath     <- chartOptions$csv_path
imgPath     <- chartOptions$img_path
xCol        <- chartOptions$x_col
xColType    <- chartOptions$x_col_type
chartTitle  <- chartOptions$chart_title
xTitle      <- chartOptions$x_title
yTitle      <- chartOptions$y_title

xTitle <- ifelse(is.null(xTitle), "x col", xTitle)
yTitle <- ifelse(is.null(yTitle), "y col", yTitle)
chartTitle <- ifelse(is.null(chartTitle), "Ranking Plot", chartTitle)
f <- list(
  family = "Open Sans, verdana, arial, sans-serif",
  size = 13,
  color = "#444444"
)
x <- list(
  title = xTitle,
  titlefont = f
)
y <- list(
  title = yTitle,
  titlefont = f
)

# check if required number of arguments are available.
if (length(chartOptions) < 5) {
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("required_args_int" = 5))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("Required arguments limit not meet.")
}

# get data frame from CSV
csvLoadTimeElapsed <- system.time(df <- GetDataFrame(paste0(csvPath)))

if(!is.data.frame(df)){
     toJSON(df)
 }else{

# check if csv load successfully or stop execution
if(length(inboundContractCheck[['error_reading_csv']]) > 0) {
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("error reading csv.")
}

# log csv load time
inboundContractCheck <- append(inboundContractCheck, 
                               list("csv_load_time_elapsed" = 
                                      csvLoadTimeElapsed[['elapsed']]))

# log if csv loaded successfully
if(nrow(df) > 0) {
  inboundContractCheck <- append(inboundContractCheck, list("csv_load_status" = TRUE))
  inboundContractCheck <- append(inboundContractCheck, list("csv_number_of_rows" = nrow(df)))
} else {
  inboundContractCheck <- append(inboundContractCheck, list("csv_load_status" = FALSE))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("CSV not loaded successfully.")
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
      
      required_val_modify <- ifelse(operator == "==" || operator == "!=",
                                    paste0(" '", required_val, "'"), 
                                    paste0(" ", required_val))
      
      filterStr <- paste0(filterStr, colname, " ", operator, 
                          required_val_modify, " & ")
      
    }
  }
  filterStr <- substr(filterStr, 1, nchar(filterStr)-3)
  
  
  # apply contains filters
  if (length(filterContainsList) > 0) {
    
    # apply log time
    containsFiltersTimeElapsed <- system.time(
      for (j in seq_along(filterContainsList)) {
        filterCol <- filterContainsList[[j]][[1]]
        filterVal <- filterContainsList[[j]][[2]]
        
        retriveTrues <- grepl(pattern = filterVal, x = df[, filterCol], 
                              ignore.case = TRUE)
        df <- df[retriveTrues, ]
      })
    
    # log contains Filters Time
    inboundContractCheck <- append(inboundContractCheck, 
                                   list("contains_fillters_time_elapsed" = 
                                          containsFiltersTimeElapsed[['elapsed']]))
    
    # log if DF have observations after contains filters
    if(nrow(df) > 0) {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter" = TRUE))
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter_int" = nrow(df)))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter" = FALSE))
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      print(toJSON(inboundContractCheck))
      stop("No rows left after applying contains filters.")
    }
  }
  
  
  # apply numeric filters
  if (nchar(filterStr) > 0) {
    
    # apply log time
    numericFiltersTimeElapsed <- system.time(
      dfFiltered <- df %>%
        filter_(filterStr)  %>%
        select(xCol))
    
    # log contains Filters Time
    inboundContractCheck <- append(inboundContractCheck, 
                                   list("numeric_fillters_time_elapsed" = 
                                          numericFiltersTimeElapsed[['elapsed']]))
    
    # log if DF have observations after numeric filters
    if(nrow(dfFiltered) > 0) {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter" = TRUE))
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter_int" = nrow(dfFiltered)))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter" = FALSE))
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      print(toJSON(inboundContractCheck))
      stop("No rows left after applying numeric filters.")
    }
    
  } else {
    dfFiltered <- df %>%
      select(xCol)
  }
  
  # coerce types
  coerceTimeElapsed <- system.time(
    dfFiltered <- convert.magic(dfFiltered, c(xColType))
  )
  
  # check if coerce columns successfull or stop execution
  if(length(inboundContractCheck[['error_coerce']]) > 0) {
    inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    print(toJSON(inboundContractCheck))
    stop("error coerce columns")
  }
  
  # log coerce time
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("coerce_time_elapsed" = 
                                        coerceTimeElapsed[['elapsed']]))
  
  if (nrow(dfFiltered) > 0) {
    
    # remove NA values
    completeRows <- complete.cases(dfFiltered)
    dfFiltered <- as.data.frame(dfFiltered[completeRows,])
    colnames(dfFiltered) <- c("filtered")
    outputWarning = FALSE
    outputError = FALSE
    colourCount = length(unique(dfFiltered$filtered))
    getPalette = colorRampPalette(brewer.pal(12, "Paired"))
    tryCatch({

        result <- try(
        chartGenerateTimeElapsed <- system.time (
          gg <- ggplot(dfFiltered, aes(filtered)) +
            #geom_bar(fill = rainbow(length(unique(dfFiltered$filtered)))) +
            geom_bar(fill = getPalette(colourCount)) +
             xlab(xTitle) +
            ylab(yTitle) + theme(
                                    plot.title = element_text(family = "Open Sans, verdana, arial, sans-serif", size = 16),
                                    axis.title.x = element_text(family = "Open Sans, verdana, arial, sans-serif", color = "#444444", size = 13),
                                    axis.title.y = element_text(family = "Open Sans, verdana, arial, sans-serif", color = "#444444",size = 13),
                                    panel.background = element_rect(colour = 'white', fill = 'white'),
                                    panel.grid.major = element_line(colour = '#eeeeee'),
                                    panel.grid.minor = element_line(colour = '#eeeeee'),
                                    axis.ticks = element_blank()
                                 )
        )
        , silent = TRUE)

        
      # Process any error messages chart_generating_error
      if (class(result) == "try-error") {
        # Ignore warnings while processing errors
        options(warn = -1)
        # set output message to error
        outputError = TRUE

        # If this script were a function, warning() and stop()
        # could be called to pass errors upstream
        msg <- geterrmessage()
        inboundContractCheck <- append(inboundContractCheck, list("chart_generating_error" = msg))

        # Restore default warning reporting
        options(warn=0)
      } else {

        result2 <- try(
          chartGenerateTimeElapsed <- system.time (
          p <- ggplotly(gg, tooltip = c("y"))
          )
          , silent = TRUE)

        # Process any error messages ggplot_to_plotly_generating_error
        if (class(result2) == "try-error") {
          # Ignore warnings while processing errors
          options(warn = -1)

          # set output message to error
          outputError = TRUE

          # If this script were a function, warning() and stop()
          # could be called to pass errors upstream
          msg <- geterrmessage()
          inboundContractCheck <- append(inboundContractCheck, list("ggplot_to_plotly_generating_error" = msg))

          # Restore default warning reporting
          options(warn=0)
        } else {
          outputResult <- try(
            outputTimeElapsed <- system.time (
            htmlwidgets::saveWidget(p, imgPath, selfcontained = FALSE)
          )
          ,silent = TRUE)

          # Process any error messages output_error
          if (class(outputResult) == "try-error") {
            # Ignore warnings while processing errors
            options(warn = -1)

            # set output message to error
            outputError = TRUE

            # If this script were a function, warning() and stop()
            # could be called to pass errors upstream
            msg <- geterrmessage()
            inboundContractCheck <- append(inboundContractCheck, list("output_error" = msg))

            # Restore default warning reporting
            options(warn=0)
          }

          # log chart generate time
          inboundContractCheck <- append(inboundContractCheck,
                                         list("chart_generate_time_elapsed" =
                                                chartGenerateTimeElapsed[['elapsed']]))

          # log output time
          inboundContractCheck <- append(inboundContractCheck,
                                         list("output_time_elapsed" =
                                                outputTimeElapsed[['elapsed']]))
        }


      }

    }, warning = function(war) {
      outputWarning = TRUE
      # warning handler picks up where warning was generated
      inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
    }, error = function(err) {
      outputError = TRUE
      # error handler picks up where error was generated
      inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))

    }) # End tryCatch

    # output generated successfully
    if(! outputError) {
      inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    }
    print(toJSON(inboundContractCheck))

  }
  
} else {
  
  dfFiltered <- df %>%
    select(xCol)
  
  # coerce types
  coerceTimeElapsed <- system.time (
    dfFiltered <- convert.magic(dfFiltered, c(xColType))
  )
  
  # check if coerce columns successfull or stop execution
  if(length(inboundContractCheck[['error_coerce']]) > 0) {
    inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    print(toJSON(inboundContractCheck))
    stop("error coerce columns")
  }
  
  # log coerce time
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("coerce_time_elapsed" = 
                                        coerceTimeElapsed[['elapsed']]))
  
  if (nrow(dfFiltered) > 0) {
    
    # remove NA values
    completeRows <- complete.cases(dfFiltered)
    dfFiltered <- as.data.frame(dfFiltered[completeRows,])
    colnames(dfFiltered) <- c("filtered")
    outputWarning = FALSE
    outputError = FALSE
    colourCount = length(unique(dfFiltered$filtered))
    getPalette = colorRampPalette(brewer.pal(12, "Paired"))
    tryCatch({

      result <- try(
        chartGenerateTimeElapsed <- system.time (
          gg <- ggplot(dfFiltered, aes(filtered)) +
            #geom_bar(fill = rainbow(length(unique(dfFiltered$filtered)))) +
            geom_bar(fill = getPalette(colourCount)) +
            xlab(xTitle) +
            ylab(yTitle)+ theme(
                                plot.title = element_text(family = "Open Sans, verdana, arial, sans-serif", size = 16),
                                 axis.title.x = element_text(family = "Open Sans, verdana, arial, sans-serif", color = "#444444", size = 13),
                                 axis.title.y = element_text(family = "Open Sans, verdana, arial, sans-serif", color = "#444444",size = 13),
                                 panel.background = element_rect(colour = 'white', fill = 'white'),
                                 panel.grid.major = element_line(colour = '#eeeeee'),
                                 panel.grid.minor = element_line(colour = '#eeeeee'),
                                 axis.ticks = element_blank()
                                 )
        )
        , silent = TRUE)


      # Process any error messages chart_generating_error
      if (class(result) == "try-error") {
        # Ignore warnings while processing errors
        options(warn = -1)
        # set output message to error
        outputError = TRUE

        # If this script were a function, warning() and stop()
        # could be called to pass errors upstream
        msg <- geterrmessage()
        inboundContractCheck <- append(inboundContractCheck, list("chart_generating_error" = msg))

        # Restore default warning reporting
        options(warn=0)
      } else {

        result2 <- try(
          chartGenerateTimeElapsed <- system.time (
            p <- ggplotly(gg, tooltip = c("y"))
          )
          , silent = TRUE)

        # Process any error messages ggplot_to_plotly_generating_error
        if (class(result2) == "try-error") {
          # Ignore warnings while processing errors
          options(warn = -1)

          # set output message to error
          outputError = TRUE

          # If this script were a function, warning() and stop()
          # could be called to pass errors upstream
          msg <- geterrmessage()
          inboundContractCheck <- append(inboundContractCheck, list("ggplot_to_plotly_generating_error" = msg))

          # Restore default warning reporting
          options(warn=0)
        } else {
          outputResult <- try(
            outputTimeElapsed <- system.time (
              htmlwidgets::saveWidget(p, imgPath, selfcontained = FALSE)
            )
            ,silent = TRUE)

          # Process any error messages output_error
          if (class(outputResult) == "try-error") {
            # Ignore warnings while processing errors
            options(warn = -1)

            # set output message to error
            outputError = TRUE

            # If this script were a function, warning() and stop()
            # could be called to pass errors upstream
            msg <- geterrmessage()
            inboundContractCheck <- append(inboundContractCheck, list("output_error" = msg))

            # Restore default warning reporting
            options(warn=0)
          }

          # log chart generate time
          inboundContractCheck <- append(inboundContractCheck,
                                         list("chart_generate_time_elapsed" =
                                                chartGenerateTimeElapsed[['elapsed']]))

          # log output time
          inboundContractCheck <- append(inboundContractCheck,
                                         list("output_time_elapsed" =
                                                outputTimeElapsed[['elapsed']]))
        }


      }

    }, warning = function(war) {
      outputWarning = TRUE
      # warning handler picks up where warning was generated
      inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
    }, error = function(err) {
      outputError = TRUE
      # error handler picks up where error was generated
      inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))

    }) # End tryCatch

    # output generated successfully
    if(! outputError) {
      inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    }
    print(toJSON(inboundContractCheck))
    
  }
}
}
objList = list()
objList <- sapply(ls(), function(x)
  objList <- x
)
inboundContractCheck <- append(inboundContractCheck, list("objList" = objList))
inboundContractCheck <- append(inboundContractCheck, list("dfFiltered" = dfFiltered))
print(toJSON(inboundContractCheck))